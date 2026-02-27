"use client";

import React, { useState, useEffect } from 'react';
import { Share2, Facebook, Twitter, Smartphone } from 'lucide-react';

const ShareWork = () => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id) {
    setShareUrl(`${window.location.origin}/ProductDetail/${id}`);
  }
}, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    let url = "";

    if (platform === 'fb') url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    if (platform === 'line') url = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
    if (platform === 'x') url = `https://twitter.com/intent/tweet?url=${encodedUrl}`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Share2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">แชร์สินค้า</h2>
          <p className="text-gray-500 text-sm mt-1">เลือกช่องทางที่คุณต้องการแบ่งปัน</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { id: 'fb', label: 'Facebook', color: 'bg-[#1877F2]', icon: <Facebook fill="currentColor" size={24} /> },
            { id: 'line', label: 'Line', color: 'bg-[#06C755]', icon: <span className="font-black text-[10px] text-white">LINE</span> },
            { id: 'x', label: 'X', color: 'bg-black', icon: <Twitter fill="currentColor" size={22} /> }
          ].map((item) => (
            <button key={item.id} onClick={() => shareToSocial(item.id)} className="flex flex-col items-center gap-2 group">
              <div className={`w-14 h-14 ${item.color} text-white rounded-2xl flex items-center justify-center shadow-md group-active:scale-90 transition-transform`}>
                {item.icon}
              </div>
              <span className="text-xs text-gray-600 font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block ml-1">คัดลอกลิงก์</label>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <div className="flex-1 px-3 text-xs text-gray-400 truncate font-medium">
              {shareUrl || "กำลังโหลด..."}
            </div>
            <button 
              onClick={handleCopy}
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                copied ? 'bg-green-400 hover:bg-green-500 text-white' : 'bg-[#FFEE91] hover:bg-[#F5C857] text-black'
              }`}
            >
              {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShareWork;