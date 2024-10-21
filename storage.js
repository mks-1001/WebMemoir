class Storage {
    constructor() {
        this.storage = chrome.storage.local;
    }

    async init() {
        // No initialization needed for chrome.storage.local
        return Promise.resolve();
    }

    async saveText(text) {
        return new Promise((resolve, reject) => {
            this.storage.get('savedTexts', (result) => {
                const savedTexts = result.savedTexts || [];
                const newText = { ...text, id: Date.now() }; // Use timestamp as ID
                savedTexts.push(newText);
                this.storage.set({ savedTexts }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(newText.id);
                    }
                });
            });
        });
    }

    async getAllTexts() {
        return new Promise((resolve, reject) => {
            this.storage.get('savedTexts', (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result.savedTexts || []);
                }
            });
        });
    }

    async deleteText(id) {
        return new Promise((resolve, reject) => {
            this.storage.get('savedTexts', (result) => {
                let savedTexts = result.savedTexts || [];
                savedTexts = savedTexts.filter(text => text.id !== id);
                this.storage.set({ savedTexts }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    async updateText(updatedText) {
        return new Promise((resolve, reject) => {
            this.storage.get('savedTexts', (result) => {
                let savedTexts = result.savedTexts || [];
                const index = savedTexts.findIndex(text => text.id === updatedText.id);
                if (index !== -1) {
                    savedTexts[index] = updatedText;
                    this.storage.set({ savedTexts }, () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve();
                        }
                    });
                } else {
                    reject(new Error('Text not found'));
                }
            });
        });
    }
}

const storage = new Storage();
