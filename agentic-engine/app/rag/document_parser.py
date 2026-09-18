import io
import re
from typing import Dict, List, Optional
from pydantic import BaseModel

try:
    import pypdf
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False


class DocumentChunk(BaseModel):
    chunk_id: str
    doc_id: str
    title: str
    page: int
    content: str
    metadata: Dict[str, str] = {}


class PDFDocumentParser:
    """Extracts, cleans, and chunks PDF documents (textbooks and research papers)."""

    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def parse_pdf_bytes(self, pdf_bytes: bytes, doc_id: str, title: str = "Quantum Paper") -> List[DocumentChunk]:
        """Parses raw PDF bytes into structured DocumentChunk records."""
        if not HAS_PYPDF:
            # Fallback if pypdf is unavailable
            return [
                DocumentChunk(
                    chunk_id=f"{doc_id}_0",
                    doc_id=doc_id,
                    title=title,
                    page=1,
                    content="PDF parsing library unavailable on server.",
                )
            ]

        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        chunks = []
        chunk_idx = 0

        for page_num, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            cleaned_text = self._clean_text(text)
            if not cleaned_text:
                continue

            page_chunks = self._chunk_text(cleaned_text)
            for pc in page_chunks:
                chunks.append(
                    DocumentChunk(
                        chunk_id=f"{doc_id}_{chunk_idx}",
                        doc_id=doc_id,
                        title=title,
                        page=page_num + 1,
                        content=pc,
                        metadata={"source": title, "page": str(page_num + 1)},
                    )
                )
                chunk_idx += 1

        return chunks

    def _clean_text(self, text: str) -> str:
        # Remove extra whitespace and strange PDF linebreaks
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def _chunk_text(self, text: str) -> List[str]:
        words = text.split()
        if len(words) <= self.chunk_size:
            return [" ".join(words)]

        chunks = []
        start = 0
        while start < len(words):
            end = min(start + self.chunk_size, len(words))
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            if end == len(words):
                break
            start += self.chunk_size - self.chunk_overlap
        return chunks


pdf_parser = PDFDocumentParser()
