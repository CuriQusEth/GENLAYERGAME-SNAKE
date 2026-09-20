import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Download, X } from 'lucide-react';

interface ShareCardProps {
  score: number;
  apples: number;
  survival: number;
  playStyle: string;
  insight: string;
  walletAddress: string;
  replayHash: string;
  verdict?: string;
  validatorAssessment?: string;
  onClose: () => void;
}

export function ShareCard({
  score,
  apples,
  survival,
  playStyle,
  insight,
  walletAddress,
  replayHash,
  verdict = 'VALID',
  validatorAssessment,
  onClose
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const profileUrl = `${window.location.origin}/?ref=${walletAddress}`;

  const downloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#000000',
        scale: 2, // High resolution
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `snakechain-proof-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Failed to generate image. Please try again.');
    }
  };

  const shareToTwitter = () => {
    const text = `I just scored ${score} in SnakeChain: Proof of Play! 🐍⚡\n\nAI rated my play style as [${playStyle}].\n\nCan you beat my on-chain record? Connect your wallet and play! #GenLayer #SnakeChain`;
    const url = encodeURIComponent(profileUrl);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
      <div className="max-w-md w-full relative">
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-gray-400 hover:text-white"
        >
          <X className="w-8 h-8" />
        </button>

        {/* The Card that will be captured */}
        <div 
          ref={cardRef} 
          className="bg-black border-2 border-green-500 p-6 relative overflow-hidden font-mono"
          style={{ width: '400px', height: '500px', margin: '0 auto' }}
        >
          {/* Background scanline effect */}
          <div className="absolute inset-0 pointer-events-none opacity-20" 
               style={{ background: 'linear-gradient(transparent 50%, rgba(0, 255, 0, 0.25) 50%)', backgroundSize: '100% 4px' }} />

          {/* Header */}
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-green-500 tracking-tighter">SNAKECHAIN</h2>
              <p className="text-[10px] text-green-700 uppercase tracking-widest">Studio Next (61997)</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded border ${
                verdict === 'INVALID' ? 'bg-red-950 text-red-400 border-red-500' : 'bg-green-950 text-green-400 border-green-500'
              }`}>
                🛡️ VERDICT: {verdict}
              </span>
              <p className="text-[10px] text-green-600 mt-1">{new Date().toISOString().split('T')[0]}</p>
            </div>
          </div>

          {/* Core Stats */}
          <div className="bg-green-950/40 border border-green-500/30 p-3 mb-3 relative z-10">
            <div className="text-center mb-2">
              <div className="text-[11px] text-green-600 uppercase">Verified Score</div>
              <div className="text-4xl font-black text-green-400" style={{ textShadow: '0 0 10px rgba(74, 222, 128, 0.5)' }}>
                {score}
              </div>
            </div>
            <div className="flex justify-between text-xs text-green-500">
              <div>APPLES: {apples}</div>
              <div>SURVIVAL: {survival}s</div>
            </div>
          </div>

          {/* Validator Consensus & Analysis */}
          <div className="mb-4 relative z-10">
            <div className="text-[9px] text-green-700 uppercase mb-1 border-b border-green-800 pb-0.5 flex justify-between">
              <span>Validator Consensus Telemetry</span>
              <span>Style: {playStyle}</span>
            </div>
            <p className="text-[11px] text-gray-300 font-mono italic">
              "{validatorAssessment || insight}"
            </p>
          </div>

          {/* Footer / Verification */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
            <div className="w-2/3 pr-4">
              <div className="text-[10px] text-green-700 uppercase mb-1">Operator ID</div>
              <div className="text-xs text-green-500 truncate">{walletAddress}</div>
              
              <div className="text-[10px] text-green-700 uppercase mt-2 mb-1">Replay Hash</div>
              <div className="text-[10px] text-gray-500 truncate">{replayHash}</div>
            </div>
            <div className="w-16 h-16 bg-white p-1 rounded-sm">
              <QRCodeSVG value={profileUrl} size={100} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>

        {/* Action Buttons (Not captured in image) */}
        <div className="flex gap-4 mt-6 justify-center">
          <button 
            onClick={downloadImage}
            className="flex items-center gap-2 px-6 py-3 bg-green-900 border border-green-500 text-green-400 hover:bg-green-800 transition-colors font-bold rounded"
          >
            <Download className="w-5 h-5" /> Save Card
          </button>
          <button 
            onClick={shareToTwitter}
            className="flex items-center gap-2 px-6 py-3 bg-[#1DA1F2]/20 border border-[#1DA1F2] text-[#1DA1F2] hover:bg-[#1DA1F2]/40 transition-colors font-bold rounded"
          >
            <Share2 className="w-5 h-5" /> Share on X
          </button>
        </div>
      </div>
    </div>
  );
}
