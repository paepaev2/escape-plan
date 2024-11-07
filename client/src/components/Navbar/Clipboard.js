import { toast } from "react-toastify";

export function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            toast.info('Code copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}