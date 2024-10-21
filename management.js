let allSavedTexts = [];
let currentPage = 1;
const rowsPerPage = 10;

document.addEventListener('DOMContentLoaded', async function() {
    await storage.init();
    loadSavedNotes();
    document.getElementById('exportBtn').addEventListener('click', exportSelected);
    document.getElementById('deleteBtn').addEventListener('click', deleteSelected);
    document.getElementById('searchInput').addEventListener('input', searchAndFilterNotes);
    document.getElementById('filterSelect').addEventListener('change', searchAndFilterNotes);
    document.getElementById('tagFilter').addEventListener('input', searchAndFilterNotes);
    document.getElementById('selectAll').addEventListener('change', toggleSelectAll);
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
});

async function loadSavedNotes() {
    try {
        console.log("Initializing storage");
        await storage.init();
        console.log("Storage initialized, fetching all texts");
        allSavedTexts = await storage.getAllTexts();
        console.log("Loaded saved texts:", allSavedTexts);
        if (allSavedTexts.length === 0) {
            console.log("No saved texts found");
        }
        searchAndFilterNotes();
    } catch (error) {
        console.error('Error loading saved texts:', error);
        alert('Failed to load saved texts. Please try again.');
    }
}

function displayNotes(notes) {
    const tableBody = document.getElementById('savedNotesBody');
    tableBody.innerHTML = '';
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageNotes = notes.slice(startIndex, endIndex);

    if (pageNotes.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = '<td colspan="5">No saved texts found</td>';
    } else {
        pageNotes.forEach((text, index) => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td><input type="checkbox" class="selectNote" data-index="${startIndex + index}"></td>
                <td>${text.name || 'Untitled'}</td>
                <td>${text.content ? text.content.substring(0, 50) + '...' : 'N/A'}</td>
                <td>${text.tags ? text.tags.join(', ') : 'N/A'}</td>
                <td>
                    <button class="action-btn viewBtn" data-index="${startIndex + index}" title="View"><span class="material-icons">visibility</span></button>
                    <button class="action-btn editBtn" data-index="${startIndex + index}" title="Edit"><span class="material-icons">edit</span></button>
                </td>
            `;
        });
    }
    addEventListeners();
    updatePagination(notes.length);
}

function searchAndFilterNotes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterOption = document.getElementById('filterSelect').value;
    const tagFilter = document.getElementById('tagFilter').value.toLowerCase().split(',').map(tag => tag.trim());

    const filteredNotes = allSavedTexts.filter(text => {
        const matchesSearch = filterOption === 'all' ?
            Object.values(text).some(value => 
                value.toString().toLowerCase().includes(searchTerm)
            ) :
            text[filterOption].toString().toLowerCase().includes(searchTerm);

        const matchesTags = tagFilter.length === 0 || 
            tagFilter.every(tag => text.tags.some(textTag => textTag.toLowerCase().includes(tag)));

        return matchesSearch && matchesTags;
    });

    currentPage = 1;
    displayNotes(filteredNotes);
}

function addEventListeners() {
    document.querySelectorAll('.viewBtn').forEach(btn => {
        btn.addEventListener('click', viewDetails);
    });
    document.querySelectorAll('.editBtn').forEach(btn => {
        btn.addEventListener('click', editNote);
    });
    document.querySelectorAll('.selectNote').forEach(checkbox => checkbox.addEventListener('change', updateActionButtons));
}

function updateActionButtons() {
    const selectedCount = document.querySelectorAll('.selectNote:checked').length;
    document.getElementById('exportBtn').disabled = selectedCount === 0;
    document.getElementById('deleteBtn').disabled = selectedCount === 0;
}

function toggleSelectAll() {
    const isChecked = document.getElementById('selectAll').checked;
    document.querySelectorAll('.selectNote').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    updateActionButtons();
}

function changePage(direction) {
    const totalPages = Math.ceil(allSavedTexts.length / rowsPerPage);
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    displayNotes(allSavedTexts);
}

function updatePagination(totalNotes) {
    const totalPages = Math.ceil(totalNotes / rowsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function getSelectedNotes() {
    const selectedIndexes = Array.from(document.querySelectorAll('.selectNote:checked'))
        .map(checkbox => parseInt(checkbox.getAttribute('data-index')));
    return allSavedTexts.filter((_, index) => selectedIndexes.includes(index));
}

function exportSelected() {
    const selectedNotes = getSelectedNotes();
    if (selectedNotes.length === 0) {
        alert('No notes selected for export.');
        return;
    }
    exportNotes(selectedNotes);
}

async function deleteSelected() {
    const selectedNotes = getSelectedNotes();
    if (selectedNotes.length === 0) {
        alert('No notes selected for deletion.');
        return;
    }
    if (confirm(`Are you sure you want to delete ${selectedNotes.length} selected note(s)?`)) {
        try {
            for (const note of selectedNotes) {
                await storage.deleteText(note.id);
            }
            await loadSavedNotes();
        } catch (error) {
            console.error('Error deleting notes:', error);
            alert('Failed to delete some notes. Please try again.');
        }
    }
}

function exportNotes(notes) {
    const format = document.getElementById('exportFormat').value;
    let content, filename, mimeType;

    switch (format) {
        case 'json':
            content = JSON.stringify(notes, null, 2);
            filename = 'saved_notes.json';
            mimeType = 'application/json';
            break;
        case 'csv':
            content = notesToCSV(notes);
            filename = 'saved_notes.csv';
            mimeType = 'text/csv';
            break;
        case 'txt':
            content = notesToPlainText(notes);
            filename = 'saved_notes.txt';
            mimeType = 'text/plain';
            break;
    }

    const blob = new Blob([content], {type: mimeType});
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
    }, function(downloadId) {
        if (chrome.runtime.lastError) {
            console.error("Download failed:", chrome.runtime.lastError);
            alert('Export failed. Please try again.');
        } else {
            console.log("Download started with ID:", downloadId);
        }
    });

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function notesToCSV(notes) {
    const headers = ['Name', 'URL', 'Content', 'Notes', 'Tags', 'Date'];
    const rows = notes.map(note => [
        note.name,
        note.url,
        note.content,
        note.notes,
        note.tags.join(';'),
        note.date
    ].map(field => `"${field.replace(/"/g, '""')}"`).join(','));
    return [headers.join(','), ...rows].join('\n');
}

function notesToPlainText(notes) {
    return notes.map(note => `
Name: ${note.name}
URL: ${note.url}
Content: ${note.content}
Notes: ${note.notes}
Tags: ${note.tags.join(', ')}
Date: ${note.date}
--------------------------`).join('\n');
}

function viewDetails(event) {
    const index = parseInt(event.currentTarget.getAttribute('data-index'));
    const text = allSavedTexts[index];
    document.getElementById('detailTitle').textContent = text.name || 'Untitled';
    document.getElementById('detailUrl').textContent = text.url || 'N/A';
    document.getElementById('detailText').innerHTML = text.content || 'N/A';
    document.getElementById('detailNotes').textContent = text.notes || 'N/A';
    document.getElementById('detailTags').textContent = text.tags ? `Tags: ${text.tags.join(', ')}` : 'No tags';
    document.getElementById('detailView').style.display = 'block';
}

function editNote(event) {
    const index = parseInt(event.target.getAttribute('data-index'));
    // Implement edit functionality
    console.log('Edit note at index:', index);
}

// Close modal when clicking on <span> (x)
document.querySelector('.close').onclick = function() {
    document.getElementById('detailView').style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('detailView');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
