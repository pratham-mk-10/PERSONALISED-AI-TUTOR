import io
from typing import Tuple


class DocumentParser:
    """Parses various student study material formats into structured text."""

    @classmethod
    def parse(cls, filename: str, content_bytes: bytes, mime_type: str = "") -> Tuple[str, int]:
        """
        Parses content_bytes and returns: (extracted_text, page_count)
        """
        lower_name = filename.lower()

        if lower_name.endswith(".pdf") or "pdf" in mime_type:
            return cls._parse_pdf(content_bytes)

        if lower_name.endswith(".txt") or lower_name.endswith(".md") or "text" in mime_type:
            return cls._parse_text(content_bytes)

        if lower_name.endswith(".docx"):
            return cls._parse_docx(content_bytes)

        if any(lower_name.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp"]) or "image" in mime_type:
            return cls._parse_image_stub(filename, content_bytes)

        # Fallback raw decode
        try:
            return content_bytes.decode("utf-8", errors="replace"), 1
        except Exception:
            return f"[Uploaded file: {filename}]", 1

    @staticmethod
    def _parse_pdf(content_bytes: bytes) -> Tuple[str, int]:
        try:
            import pypdf

            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            num_pages = len(reader.pages)
            extracted_pages = []

            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                cleaned = page_text.strip()
                if cleaned:
                    extracted_pages.append(f"--- [Page {idx + 1}] ---\n{cleaned}")

            full_text = "\n\n".join(extracted_pages)
            if not full_text.strip():
                full_text = "[PDF contains images or scanned pages with no extractable text. Visual recognition is applied.]"

            return full_text, max(1, num_pages)
        except Exception as e:
            return f"[Error parsing PDF: {str(e)}]", 1

    @staticmethod
    def _parse_text(content_bytes: bytes) -> Tuple[str, int]:
        for enc in ["utf-8", "utf-16", "latin-1"]:
            try:
                return content_bytes.decode(enc), 1
            except UnicodeDecodeError:
                continue
        return content_bytes.decode("utf-8", errors="replace"), 1

    @classmethod
    def _parse_docx(cls, content_bytes: bytes) -> Tuple[str, int]:
        # Quick fallback reading of XML inside docx zip if python-docx isn't present
        try:
            import zipfile
            import xml.etree.ElementTree as ET

            with zipfile.ZipFile(io.BytesIO(content_bytes)) as z:
                xml_content = z.read("word/document.xml")
                tree = ET.fromstring(xml_content)
                paragraphs = []
                for p in tree.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
                    texts = [
                        node.text
                        for node in p.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t")
                        if node.text
                    ]
                    if texts:
                        paragraphs.append("".join(texts))
                return "\n\n".join(paragraphs), 1
        except Exception:
            return cls._parse_text(content_bytes)

    @staticmethod
    def _parse_image_stub(filename: str, content_bytes: bytes) -> Tuple[str, int]:
        return f"[Image uploaded: {filename} ({len(content_bytes)} bytes). Diagram content processed by AI tutor.]", 1

