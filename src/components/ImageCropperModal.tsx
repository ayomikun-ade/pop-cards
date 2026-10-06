import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area, getCroppedImg } from '../utils/cropImage';
import { ZoomIn, ZoomOut, Check, X } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  aspect: number;
  cropShape?: 'rect' | 'round';
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  aspect,
  cropShape = 'rect',
  isOpen,
  onClose,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      onClose();
    } catch (e) {
      console.error('Error generating cropped image:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Crop Portrait Photo</h3>
            <p className="text-xs text-slate-500">Pinch or drag to position your face cleanly in the frame</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-80 sm:h-96 bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={true}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls */}
        <div className="p-6 bg-slate-50 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              aria-label="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <ZoomIn className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Apply Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
