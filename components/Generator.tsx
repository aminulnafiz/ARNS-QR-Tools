
import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../store';
import { 
  GlobeIcon, FileTextIcon, PhoneIcon, MailIcon, UserIcon, 
  MessageCircleIcon, WifiIcon, DollarSignIcon, MapPinIcon, SendIcon 
} from './Icons';

type QRType = 'URL' | 'TEXT' | 'PHONE' | 'EMAIL' | 'VCARD' | 'WHATSAPP' | 'WIFI' | 'PAYMENT' | 'SMS' | 'LOCATION';

interface QRPreset {
  id: string;
  name: string;
  qrColor: string;
  bgColor: string;
  logo: string | null;
  size: number;
}

interface QRTypeOption {
  id: QRType;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const QR_TYPES: QRTypeOption[] = [
  { id: 'URL', label: 'Website', icon: GlobeIcon },
  { id: 'TEXT', label: 'Plain Text', icon: FileTextIcon },
  { id: 'PHONE', label: 'Phone', icon: PhoneIcon },
  { id: 'EMAIL', label: 'Email', icon: MailIcon },
  { id: 'VCARD', label: 'Contact', icon: UserIcon },
  { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircleIcon },
  { id: 'WIFI', label: 'WiFi', icon: WifiIcon },
  { id: 'PAYMENT', label: 'Payment', icon: DollarSignIcon },
  { id: 'SMS', label: 'SMS', icon: SendIcon },
  { id: 'LOCATION', label: 'Map Link', icon: MapPinIcon },
];

const Generator: React.FC = () => {
  const { addHistory } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core State
  const [type, setType] = useState<QRType>('URL');
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [selectedSize, setSelectedSize] = useState(400);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoOffset, setLogoOffset] = useState({ x: 0, y: 0 });

  // Presets State
  const [presets, setPresets] = useState<QRPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showPresetInput, setShowPresetInput] = useState(false);

  // Dynamic Form States
  const [formData, setFormData] = useState<any>({
    url: '',
    text: '',
    phone: '',
    email: { to: '', subject: '', body: '' },
    vcard: { firstName: '', lastName: '', phone: '', email: '', company: '', website: '', address: '' },
    whatsapp: { phone: '', message: '' },
    wifi: { ssid: '', password: '', auth: 'WPA' },
    payment: { recipient: '', amount: '', currency: 'USD', note: '' },
    sms: { phone: '', message: '' },
    location: { lat: '', lng: '' }
  });

  // UI States
  const [isGenerated, setIsGenerated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to load last used type and presets
  useEffect(() => {
    const saved = localStorage.getItem('arns_last_qr_type');
    if (saved) setType(saved as QRType);
    
    const savedData = localStorage.getItem('arns_last_qr_data');
    if (savedData) setFormData(JSON.parse(savedData));

    const savedPresets = localStorage.getItem('arns_qr_presets');
    if (savedPresets) setPresets(JSON.parse(savedPresets));
  }, []);

  // Save changes locally
  useEffect(() => {
    localStorage.setItem('arns_last_qr_type', type);
    localStorage.setItem('arns_last_qr_data', JSON.stringify(formData));
  }, [type, formData]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [type.toLowerCase()]: value }));
  };

  const clearForm = () => {
    setFormData((prev: any) => ({
      ...prev,
      [type.toLowerCase()]: typeof prev[type.toLowerCase()] === 'object' ? 
        Object.keys(prev[type.toLowerCase()]).reduce((acc, k) => ({ ...acc, [k]: '' }), {}) : ''
    }));
    setIsGenerated(false);
  };

  const getFormattedContent = (): string => {
    const d = formData[type.toLowerCase()];
    switch (type) {
      case 'URL': return d.startsWith('http') ? d : `https://${d}`;
      case 'TEXT': return d;
      case 'PHONE': return `tel:${d.replace(/\s+/g, '')}`;
      case 'EMAIL': return `mailto:${d.to}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`;
      case 'WHATSAPP': return `https://wa.me/${d.phone.replace(/\D/g, '')}?text=${encodeURIComponent(d.message)}`;
      case 'WIFI': return `WIFI:T:${d.auth};S:${d.ssid};P:${d.password};;`;
      case 'SMS': return `SMSTO:${d.phone}:${d.message}`;
      case 'LOCATION': return `https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`;
      case 'PAYMENT': return `https://paypal.me/${d.recipient}/${d.amount}`;
      case 'VCARD': 
        return `BEGIN:VCARD
VERSION:3.0
N:${d.lastName};${d.firstName};;;
FN:${d.firstName} ${d.lastName}
ORG:${d.company}
URL:${d.website}
EMAIL:${d.email}
TEL;TYPE=CELL:${d.phone}
ADR;TYPE=WORK:;;${d.address};;;;
END:VCARD`;
      default: return '';
    }
  };

  const validateInput = (): boolean => {
    const d = formData[type.toLowerCase()];
    if (type === 'URL') return !!d.trim();
    if (type === 'TEXT') return !!d.trim();
    if (type === 'PHONE') return !!d.trim();
    if (type === 'EMAIL') return !!d.to.trim();
    if (type === 'WIFI') return !!d.ssid.trim();
    if (type === 'WHATSAPP') return !!d.phone.trim();
    if (type === 'VCARD') return !!d.firstName.trim();
    if (type === 'SMS') return !!d.phone.trim();
    if (type === 'LOCATION') return !!d.lat && !!d.lng;
    if (type === 'PAYMENT') return !!d.recipient.trim();
    return false;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setLogo(readerEvent.target?.result as string);
        setIsGenerated(false); // Reset preview on new logo
      };
      reader.readAsDataURL(file);
    }
  };

  const savePreset = () => {
    if (!presetName.trim()) return;
    const newPreset: QRPreset = {
      id: Date.now().toString(),
      name: presetName,
      qrColor,
      bgColor,
      logo,
      size: selectedSize
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem('arns_qr_presets', JSON.stringify(updated));
    setPresetName('');
    setShowPresetInput(false);
  };

  const loadPreset = (p: QRPreset) => {
    setQrColor(p.qrColor);
    setBgColor(p.bgColor);
    setLogo(p.logo);
    setSelectedSize(p.size);
    setIsGenerated(false);
  };

  const deletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem('arns_qr_presets', JSON.stringify(updated));
  };

  const nudgeLogo = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const step = 5;
    setLogoOffset(prev => {
      switch (dir) {
        case 'UP': return { ...prev, y: prev.y - step };
        case 'DOWN': return { ...prev, y: prev.y + step };
        case 'LEFT': return { ...prev, x: prev.x - step };
        case 'RIGHT': return { ...prev, x: prev.x + step };
        default: return prev;
      }
    });
    setIsGenerated(false);
  };

  const generateQRCode = async () => {
    if (!validateInput()) {
      setError('Required fields are missing.');
      return;
    }

    const content = getFormattedContent();
    setError(null);
    setIsProcessing(true);
    setIsGenerated(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 80));
      if (!canvasRef.current) throw new Error('Render target unavailable');

      await QRCode.toCanvas(canvasRef.current, content, {
        width: selectedSize,
        margin: 2,
        color: { dark: qrColor, light: bgColor },
        errorCorrectionLevel: logo ? 'H' : 'M'
      });

      if (logo && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.src = logo;
          await new Promise((resolve) => {
            img.onload = () => {
              const lSize = selectedSize * 0.22;
              // Center position plus the nudge offsets
              const x = ((selectedSize - lSize) / 2) + logoOffset.x;
              const y = ((selectedSize - lSize) / 2) + logoOffset.y;
              
              ctx.fillStyle = bgColor;
              ctx.fillRect(x - 2, y - 2, lSize + 4, lSize + 4);
              ctx.drawImage(img, x, y, lSize, lSize);
              resolve(true);
            };
            img.onerror = () => resolve(false);
          });
        }
      }

      addHistory({ type: 'GENERATE', content, qrType: type });
      setIsProcessing(false);
    } catch (err: any) {
      setError('Generation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const downloadQR = (format: 'png' | 'svg') => {
    if (!canvasRef.current) return;
    const content = getFormattedContent();

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `QR_${type}_${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    } else {
      QRCode.toString(content, { type: 'svg', width: selectedSize, color: { dark: qrColor, light: bgColor } })
        .then(svg => {
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `QR_${type}_${Date.now()}.svg`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        });
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-black text-white italic tracking-tighter">QR Studio <span className="text-blue-500">PRO</span></h2>
        <p className="text-slate-500 text-sm font-medium">Professional grade QR generation suite</p>
      </div>

      {/* Smart Type Selector */}
      <div className="grid grid-cols-5 gap-2 pb-2 overflow-x-auto no-scrollbar">
        {QR_TYPES.map((opt) => (
          <button
            key={opt.id}
            onClick={() => { setType(opt.id); setIsGenerated(false); setError(null); }}
            className={`flex flex-col items-center justify-center min-w-[70px] aspect-square rounded-2xl border transition-all duration-300 ${
              type === opt.id 
                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
            }`}
          >
            <opt.icon className="w-5 h-5 mb-1.5" />
            <span className="text-[9px] font-black uppercase tracking-tighter">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Form Card */}
      <div className="glass p-6 rounded-[2.5rem] border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
            {QR_TYPES.find(t => t.id === type)?.label} Details
          </h3>
          <button onClick={clearForm} className="text-[10px] font-black uppercase text-slate-600 hover:text-rose-500 transition-colors">Clear Field</button>
        </div>

        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {type === 'URL' && (
            <input 
              type="text" 
              placeholder="https://example.com" 
              value={formData.url} 
              onChange={e => updateFormData(e.target.value, e.target.value)} 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all font-medium" 
            />
          )}

          {type === 'TEXT' && (
            <div className="relative">
              <textarea 
                rows={4} 
                placeholder="Enter your message here..." 
                value={formData.text} 
                onChange={e => updateFormData(e.target.value, e.target.value)} 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all resize-none" 
              />
              <span className="absolute bottom-4 right-5 text-[10px] font-bold text-slate-600 uppercase">{formData.text.length} Chars</span>
            </div>
          )}

          {type === 'PHONE' && (
            <input 
              type="tel" 
              placeholder="+1 234 567 890" 
              value={formData.phone} 
              onChange={e => updateFormData(e.target.value, e.target.value)} 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all" 
            />
          )}

          {type === 'EMAIL' && (
            <div className="space-y-3">
              <input type="email" placeholder="Recipient Email" value={formData.email.to} onChange={e => updateFormData(e.target.value, { ...formData.email, to: e.target.value })} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500" />
              <input type="text" placeholder="Subject Line" value={formData.email.subject} onChange={e => updateFormData(e.target.value, { ...formData.email, subject: e.target.value })} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500" />
              <textarea placeholder="Message Body" value={formData.email.body} onChange={e => updateFormData(e.target.value, { ...formData.email, body: e.target.value })} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 h-24" />
            </div>
          )}

          {type === 'VCARD' && (
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="First Name" value={formData.vcard.firstName} onChange={e => updateFormData(e.target.value, { ...formData.vcard, firstName: e.target.value })} className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
              <input placeholder="Last Name" value={formData.vcard.lastName} onChange={e => updateFormData(e.target.value, { ...formData.vcard, lastName: e.target.value })} className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
              <input placeholder="Phone Number" value={formData.vcard.phone} onChange={e => updateFormData(e.target.value, { ...formData.vcard, phone: e.target.value })} className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
              <input placeholder="Email" value={formData.vcard.email} onChange={e => updateFormData(e.target.value, { ...formData.vcard, email: e.target.value })} className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
              <input placeholder="Company" value={formData.vcard.company} onChange={e => updateFormData(e.target.value, { ...formData.vcard, company: e.target.value })} className="col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
              <input placeholder="Website" value={formData.vcard.website} onChange={e => updateFormData(e.target.value, { ...formData.vcard, website: e.target.value })} className="col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
              <textarea placeholder="Address" value={formData.vcard.address} onChange={e => updateFormData(e.target.value, { ...formData.vcard, address: e.target.value })} className="col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none h-20" />
            </div>
          )}

          {type === 'WHATSAPP' && (
            <div className="space-y-3">
              <input placeholder="WhatsApp Number (+8801...)" value={formData.whatsapp.phone} onChange={e => updateFormData(e.target.value, { ...formData.whatsapp, phone: e.target.value })} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-500" />
              <textarea placeholder="Preset Message" value={formData.whatsapp.message} onChange={e => updateFormData(e.target.value, { ...formData.whatsapp, message: e.target.value })} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-500 h-24" />
            </div>
          )}

          {type === 'WIFI' && (
            <div className="space-y-3">
              <input placeholder="Network SSID" value={formData.wifi.ssid} onChange={e => updateFormData(e.target.value, { ...formData.wifi, ssid: e.target.value })} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none" />
              <input type="password" placeholder="Password" value={formData.wifi.password} onChange={e => updateFormData(e.target.value, { ...formData.wifi, password: e.target.value })} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none" />
              <select value={formData.wifi.auth} onChange={e => updateFormData(e.target.value, { ...formData.wifi, auth: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Open (No Security)</option>
              </select>
            </div>
          )}

          {type === 'PAYMENT' && (
            <div className="space-y-3">
              <input placeholder="PayPal Username" value={formData.payment.recipient} onChange={e => updateFormData(e.target.value, { ...formData.payment, recipient: e.target.value })} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none" />
              <div className="flex gap-2">
                <input placeholder="Amount" type="number" value={formData.payment.amount} onChange={e => updateFormData(e.target.value, { ...formData.payment, amount: e.target.value })} className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none" />
                <select value={formData.payment.currency} onChange={e => updateFormData(e.target.value, { ...formData.payment, currency: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-2xl px-4 text-white">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="BDT">BDT</option>
                </select>
              </div>
            </div>
          )}

          {type === 'SMS' && (
            <div className="space-y-3">
              <input placeholder="Phone Number" value={formData.sms.phone} onChange={e => updateFormData(e.target.value, { ...formData.sms, phone: e.target.value })} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none" />
              <textarea placeholder="Text Message" value={formData.sms.message} onChange={e => updateFormData(e.target.value, { ...formData.sms, message: e.target.value })} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none h-24" />
            </div>
          )}

          {type === 'LOCATION' && (
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Latitude" type="number" value={formData.location.lat} onChange={e => updateFormData(e.target.value, { ...formData.location, lat: e.target.value })} className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
              <input placeholder="Longitude" type="number" value={formData.location.lng} onChange={e => updateFormData(e.target.value, { ...formData.location, lng: e.target.value })} className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
              <p className="col-span-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center italic">Tip: Use Google Maps to find coordinates</p>
            </div>
          )}
        </div>

        {/* Customization Options Row */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Pattern Color</label>
            <div className="flex gap-2">
              <input type="color" value={qrColor} onChange={e => { setQrColor(e.target.value); setIsGenerated(false); }} title="QR Pattern Color" className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden" />
              <input type="color" value={bgColor} onChange={e => { setBgColor(e.target.value); setIsGenerated(false); }} title="Background Color" className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Brand Logo</label>
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase text-white transition-all active:scale-95 ${
                    logo ? 'bg-slate-800 border border-slate-700' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {logo ? 'Replace' : 'Upload'}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              </div>

              {logo && (
                <div className="flex items-center space-x-2 animate-in fade-in zoom-in-90 duration-300">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 p-0.5 bg-white/5 shadow-lg relative group">
                    <img src={logo} alt="Preview" className="w-full h-full object-contain rounded-md" />
                  </div>
                  <button 
                    onClick={() => { setLogo(null); setIsGenerated(false); setLogoOffset({x:0, y:0}); }} 
                    className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    <span className="text-sm">×</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logo Nudge Controls */}
        {logo && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Logo Positioning (Nudge)</label>
            <div className="flex items-center space-x-4 bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
              <div className="grid grid-cols-3 gap-1">
                <div />
                <button onClick={() => nudgeLogo('UP')} className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs">↑</button>
                <div />
                <button onClick={() => nudgeLogo('LEFT')} className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs">←</button>
                <button onClick={() => setLogoOffset({x:0, y:0})} className="w-8 h-8 flex items-center justify-center bg-slate-700 text-blue-400 rounded-lg text-[8px] font-bold">RESET</button>
                <button onClick={() => nudgeLogo('RIGHT')} className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs">→</button>
                <div />
                <button onClick={() => nudgeLogo('DOWN')} className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs">↓</button>
                <div />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase">X Offset: <span className="text-blue-400">{logoOffset.x}px</span></p>
                <p className="text-[9px] font-black text-slate-500 uppercase">Y Offset: <span className="text-blue-400">{logoOffset.y}px</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Presets Management Section */}
        <div className="space-y-4 pt-4 border-t border-slate-800/50">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Style Presets</label>
            <button 
              onClick={() => setShowPresetInput(!showPresetInput)}
              className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 transition-colors"
            >
              {showPresetInput ? 'Cancel' : '+ Save Preset'}
            </button>
          </div>

          {showPresetInput && (
            <div className="flex space-x-2 animate-in fade-in slide-in-from-top-2">
              <input 
                type="text" 
                placeholder="Preset Name..." 
                value={presetName}
                onChange={e => setPresetName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none"
              />
              <button 
                onClick={savePreset}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase"
              >
                Save
              </button>
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {presets.length === 0 && (
              <p className="text-[9px] text-slate-600 italic">No custom presets saved yet.</p>
            )}
            {presets.map(p => (
              <div 
                key={p.id}
                onClick={() => loadPreset(p)}
                className="flex-shrink-0 flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-full px-4 py-2 cursor-pointer transition-all group"
              >
                <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: p.qrColor }} />
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200">{p.name}</span>
                <button 
                  onClick={(e) => deletePreset(p.id, e)}
                  className="w-4 h-4 rounded-full bg-slate-800 text-slate-600 hover:text-rose-500 flex items-center justify-center transition-colors"
                >
                  <span className="text-[10px]">×</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-rose-500 text-[10px] font-black uppercase text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}

        <button 
          onClick={generateQRCode}
          disabled={isProcessing}
          className={`w-full py-5 rounded-[1.5rem] font-black text-white uppercase tracking-[0.2em] transition-all ${
            isProcessing ? 'bg-slate-700' : 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30 active:scale-95'
          }`}
        >
          {isProcessing ? 'Crafting QR...' : 'Create QR Code'}
        </button>
      </div>

      {/* Result Display */}
      {isGenerated && (
        <div className="animate-in zoom-in-95 duration-500">
          <div className="glass p-10 rounded-[3rem] border-slate-800 flex flex-col items-center shadow-2xl relative">
            <div className="qr-canvas-container bg-white p-6 rounded-[2.5rem] shadow-2xl mb-10 ring-8 ring-slate-900/30 overflow-hidden">
               <canvas ref={canvasRef} className="max-w-full" style={{ width: '280px', height: '280px' }} />
            </div>

            <div className="grid grid-cols-2 w-full gap-4">
              <button onClick={() => downloadQR('png')} className="bg-white text-slate-950 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Download PNG</button>
              <button onClick={() => downloadQR('svg')} className="bg-slate-800 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest border border-slate-700 hover:bg-slate-700 transition-all active:scale-95">Export SVG</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generator;
