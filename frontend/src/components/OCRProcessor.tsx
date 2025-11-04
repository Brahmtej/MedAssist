import { useState } from 'react'
import { Upload, FileText, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import Tesseract from 'tesseract.js'

interface OCRProcessorProps {
  onTextExtracted: (text: string) => void
  onImageSelected: (imageData: string, fileName: string) => void
}

export default function OCRProcessor({ onTextExtracted, onImageSelected }: OCRProcessorProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrComplete, setOcrComplete] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset states
    setOcrComplete(false)
    setOcrError(null)
    setOcrProgress(0)

    // Create preview
    const reader = new FileReader()
    reader.onload = async (event) => {
      const imageData = event.target?.result as string
      setPreview(imageData)
      onImageSelected(imageData, file.name)
      
      // Try OCR processing
      await performOCR(imageData)
    }
    reader.readAsDataURL(file)
  }

  async function performOCR(imageData: string) {
    setIsProcessing(true)
    setOcrError(null)

    try {
      const result = await Tesseract.recognize(
        imageData,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100))
            }
          }
        }
      )

      const extractedText = result.data.text.trim()
      
      if (extractedText) {
        onTextExtracted(extractedText)
        setOcrComplete(true)
      } else {
        setOcrError('No text detected. Please enter manually below.')
        onTextExtracted('No text detected. Please enter prescription details manually.')
      }
    } catch (error: any) {
      console.error('OCR Error:', error)
      setOcrError('OCR processing failed. Please enter text manually.')
      onTextExtracted('Please enter prescription details manually.')
    } finally {
      setIsProcessing(false)
      setOcrProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-400 transition-colors">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="prescription-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Upload prescription image
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                PNG, JPG, or JPEG • Clear text for best OCR results
              </span>
              <input
                id="prescription-upload"
                type="file"
                className="sr-only"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageUpload}
                disabled={isProcessing}
              />
              <span className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {isProcessing ? 'Processing...' : 'Select Image'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Processing image with OCR...
              </p>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-blue-600">
                {ocrProgress}% complete
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Status */}
      {ocrComplete && !isProcessing && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Text extracted successfully!
              </p>
              <p className="mt-1 text-xs text-green-700">
                Please review and edit the extracted text below. OCR may require corrections.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Status */}
      {ocrError && !isProcessing && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                {ocrError}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                You can still enter the prescription details manually in the text field below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {preview && !isProcessing && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Image uploaded
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {ocrComplete ? 'Text extracted. Review below and make any necessary corrections.' : 'Enter prescription details in the text field below.'}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <img 
              src={preview} 
              alt="Prescription preview" 
              className="max-h-48 rounded border border-gray-300 mx-auto"
            />
          </div>
        </div>
      )}

      {/* OCR Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs font-medium text-blue-900 mb-1">Tips for best OCR results:</p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Use clear, well-lit images</li>
          <li>Ensure text is straight and in focus</li>
          <li>Avoid shadows and glare</li>
          <li>Higher resolution images work better</li>
        </ul>
      </div>
    </div>
  )
}
