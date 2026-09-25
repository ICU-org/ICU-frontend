/** Отдать файл браузеру на скачивание. */
export function saveFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // освободить память после того, как браузер начал скачивание
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
