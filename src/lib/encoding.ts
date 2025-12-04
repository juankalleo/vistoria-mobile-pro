export function arrayBufferToBase64(ab: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(ab);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return "data:application/pdf;base64," + btoa(binary);
}