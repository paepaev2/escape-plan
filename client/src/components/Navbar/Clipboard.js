export function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            alert('Code copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}