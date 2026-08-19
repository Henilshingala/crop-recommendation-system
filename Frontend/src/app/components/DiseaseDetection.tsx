import { useState } from "react";
import { Upload, AlertCircle, CheckCircle2, Stethoscope, Leaf } from "lucide-react";

export function DiseaseDetection() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ disease: string; confidence: number; treatment: string } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    setResult(null);

    // Mock analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      // Hardcoded mock result for demonstration
      setResult({
        disease: "Early Blight (Alternaria solani)",
        confidence: 94.5,
        treatment: "1. Remove and destroy infected leaves.\n2. Apply copper-based fungicide.\n3. Ensure proper spacing for air circulation."
      });
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="glass-card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Crop Disease Detection</h2>
          <p className="text-gray-600 mt-2">Upload a clear photo of the affected crop leaf for instant AI analysis.</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Upload Area */}
          {!image ? (
            <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-12 text-center hover:bg-emerald-50/50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className="text-emerald-800 font-medium text-lg">Click to upload or drag and drop</p>
              <p className="text-emerald-600/70 text-sm mt-2">PNG, JPG or JPEG (max 5MB)</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <img src={image} alt="Uploaded crop" className="w-full h-64 object-cover" />
                <button 
                  onClick={() => { setImage(null); setResult(null); }}
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white shadow-sm"
                >
                  Change Image
                </button>
              </div>

              {!result && (
                <button 
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <Leaf className="w-5 h-5" />
                      Analyze Disease
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Results Area */}
          {result && (
            <div className="mt-8 p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-900">{result.disease}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                      Confidence: {result.confidence}%
                    </span>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Recommended Treatment:</h4>
                    <div className="bg-white/60 p-4 rounded-xl border border-red-100">
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {result.treatment}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
