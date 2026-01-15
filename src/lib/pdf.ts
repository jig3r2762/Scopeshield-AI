export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid build-time issues with pdf-parse
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}
