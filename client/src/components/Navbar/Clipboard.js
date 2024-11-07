import { toast } from "react-toastify";

export function copyToClipboard(text) {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    // Use the modern Clipboard API
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.info("Code copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  } else {
    // Fallback method for insecure contexts or unsupported browsers
    fallbackCopyToClipboard(text);
  }
}

function fallbackCopyToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to the bottom
  textArea.style.position = "fixed";
  textArea.style.top = "-1000px";
  textArea.style.left = "-1000px";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    if (successful) {
      toast.info("Code copied to clipboard!");
    } else {
      console.error("Fallback: Oops, unable to copy");
    }
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}
