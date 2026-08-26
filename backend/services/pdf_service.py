import io
import pymupdf
from PIL import Image
from typing import List

DEFAULT_DPI = 150

# Reason: Rasterize PDF bytes into fixed-DPI PIL Images using pymupdf
def pdf_to_page_images(pdf_bytes: bytes, dpi: int = DEFAULT_DPI) -> List[Image.Image]:
    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    images = []
    zoom = dpi / 72.0
    matrix = pymupdf.Matrix(zoom, zoom)
    for page_idx in range(len(doc)):
        page = doc.load_page(page_idx)
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        images.append(img)
    doc.close()
    return images

# Reason: Process uploaded file bytes (either PDF or raw Image) to page images
def process_upload_to_images(file_bytes: bytes, filename: str, dpi: int = DEFAULT_DPI) -> List[Image.Image]:
    lower_name = filename.lower()
    if lower_name.endswith(".pdf"):
        return pdf_to_page_images(file_bytes, dpi=dpi)
    else:
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        return [img]

# Reason: Convert PIL Image to PNG bytes
def image_to_bytes(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
