// يحوّل عنصر SVG إلى PNG (بدقة مضاعفة) عبر Canvas
export function svgToPng(svgEl, w, h) {
  return new Promise((resolve, reject) => {
    try {
      const xml = new XMLSerializer().serializeToString(svgEl);
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = w * 2;
        canvas.height = h * 2;
        const ctx = canvas.getContext("2d");
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("تعذّر تحميل صورة SVG"));
      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}
