
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Student } from '../types';

interface AddStudentFormProps {
  onAdd: (student: Student) => void;
  onCancel: () => void;
  studentsCount: number;
  students: Student[];
  isSaving?: boolean;
}

const LEVEL_ORDER = ['تمهيدي', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];

const DynamicSelect = ({ name, label, options, placeholder, value, onChange, isManual, toggleManual }: any) => {
  return (
    <div className="space-y-3">
      <label className="text-[12px] font-black text-[#84754E] uppercase pr-1 tracking-[0.2em]">{label}</label>
      {isManual ? (
        <div className="relative animate-fade">
          <input 
            name={name} 
            type="text" 
            value={value || ''} 
            onChange={onChange}
            onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }}
            placeholder={`إدخل ${label}...`}
            className="w-full px-6 py-5 bg-[#F9F9F9] border border-[#84754E]/20 rounded-2xl outline-none font-bold text-[#444] shadow-inner focus:border-[#84754E] transition-all"
            autoFocus
          />
          <button type="button" onClick={() => toggleManual(name, false)} className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] bg-white text-[#84754E] px-4 py-2 rounded-xl shadow-md font-black border border-[#EDEDED] uppercase tracking-widest">عودة</button>
        </div>
      ) : (
        <div className="relative">
          <select 
            name={name} 
            value={value || ''} 
            onChange={(e) => {
              if (e.target.value === "__MANUAL__") toggleManual(name, true);
              else onChange(e);
            }} 
            className="w-full px-7 py-5 bg-[#F9F9F9] border border-transparent rounded-2xl outline-none font-bold appearance-none cursor-pointer hover:bg-white focus:bg-white focus:border-[#84754E]/20 transition-all text-right text-[#444] shadow-sm"
          >
            <option value="">{placeholder}</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            <option value="__MANUAL__" className="text-[#84754E] font-black">+ إضافة قيمة جديدة</option>
          </select>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#84754E]/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      )}
    </div>
  );
};

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onAdd, onCancel, studentsCount, students, isSaving = false }) => {
  const [step, setStep] = useState(1);
  const [manualInputs, setManualInputs] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Partial<Student>>({
    regDate: new Date().toISOString().split('T')[0],
    fees: 'لا',
    completion: '0%'
  });

  const dropdownOptions = useMemo(() => {
    const getUnique = (key: keyof Student) => {
      const vals = students.map(s => s[key]).filter(v => v && v.trim() !== '');
      return Array.from(new Set(vals)).sort();
    };
    return {
      teachers: getUnique('teacher'),
      circles: getUnique('circle'),
      categories: getUnique('category'),
      periods: getUnique('period'),
    };
  }, [students]);

  const toggleManual = (name: string, isManual: boolean) => setManualInputs(prev => ({ ...prev, [name]: isManual }));

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'dob' && value) {
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        updated.age = age.toString();
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    const essentialFields = ['name', 'phone', 'nationality', 'dob', 'address', 'teacher', 'circle', 'level', 'nationalId', 'category', 'period'];
    const filledCount = essentialFields.filter(k => (formData as any)[k] && (formData as any)[k].trim() !== '').length;
    const percentage = Math.round((filledCount / essentialFields.length) * 100);
    setFormData(prev => ({ ...prev, completion: `${percentage}%` }));
  }, [formData]);

  const handleFinalSubmit = () => {
    if (isSaving || !formData.name) return;
    onAdd({
      id: (studentsCount + 1).toString(),
      name: formData.name || '',
      nationality: formData.nationality || '',
      dob: formData.dob || '',
      phone: formData.phone || '',
      age: formData.age || '',
      qualification: '', job: '', address: '',
      regDate: formData.regDate || '',
      level: formData.level || '',
      part: formData.part || '',
      nationalId: formData.nationalId || '',
      category: formData.category || '',
      period: formData.period || '',
      expiryId: formData.expiryId || '',
      teacher: formData.teacher || '',
      fees: formData.fees || 'لا',
      circle: formData.circle || '',
      completion: formData.completion || '0%'
    });
  };

  return (
    <div className={`max-w-5xl mx-auto bg-white rounded-[2.5rem] border border-[#EBEBEB] shadow-2xl overflow-hidden mb-16 relative transition-all duration-300 ${isSaving ? 'opacity-70 scale-[0.99]' : ''}`}>
      <div className="bg-[#84754E] p-14 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-1.5 bg-white/10">
          <div className="h-full bg-white transition-all duration-1000 shadow-[0_0_15px_white]" style={{ width: formData.completion }}></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10"></div>
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
          <div>
            <h3 className="text-3xl font-black mb-2 tracking-tight">تسجيل دارس جديد</h3>
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.3em]">نسبة اكتمال ملف البيانات: {formData.completion}</p>
          </div>
          <div className="flex gap-6">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black transition-all duration-500 border-2 ${step >= s ? 'bg-white text-[#84754E] border-white shadow-xl' : 'bg-white/5 border-white/20 text-white/40'}`}>{s}</div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${step >= s ? 'text-white' : 'text-white/30'}`}>
                  {s === 1 ? 'شخصية' : s === 2 ? 'أكاديمية' : 'إدارية'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-16 space-y-12">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade">
            <div className="space-y-3">
              <label className="text-[12px] font-black text-[#84754E] uppercase pr-1 tracking-[0.2em]">الاسم الرباعي الكامل</label>
              <input name="name" type="text" value={formData.name || ''} onChange={handleChange} className="w-full px-7 py-5 bg-[#F9F9F9] rounded-2xl outline-none font-bold border border-transparent focus:bg-white focus:border-[#84754E]/20 transition-all shadow-sm" placeholder="أدخل الاسم..." />
            </div>
            <div className="space-y-3">
              <label className="text-[12px] font-black text-[#84754E] uppercase pr-1 tracking-[0.2em]">رقام الهاتف للتواصل</label>
              <input name="phone" type="text" value={formData.phone || ''} onChange={handleChange} className="w-full px-7 py-5 bg-[#F9F9F9] rounded-2xl outline-none font-bold border border-transparent focus:bg-white focus:border-[#84754E]/20 transition-all shadow-sm" placeholder="05xxxxxxxx" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[12px] font-black text-[#84754E] uppercase pr-1 tracking-[0.2em]">تاريخ الميلاد</label>
                <input 
                  name="dob" 
                  type="date" 
                  lang="en-GB"
                  value={formData.dob || ''} 
                  onChange={handleChange} 
                  className="w-full px-5 py-5 bg-[#F9F9F9] rounded-2xl outline-none font-bold" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[12px] font-black text-[#84754E] uppercase pr-1 tracking-[0.2em]">العمر التلقائي</label>
                <input name="age" type="text" value={formData.age || ''} readOnly className="w-full px-5 py-5 bg-[#F4F1EA] text-[#84754E] rounded-2xl font-black text-center border border-[#EADBC8] shadow-inner" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[12px] font-black text-[#84754E] uppercase pr-1 tracking-[0.2em]">جنسية الدارس</label>
              <input name="nationality" type="text" value={formData.nationality || ''} onChange={handleChange} className="w-full px-7 py-5 bg-[#F9F9F9] rounded-2xl outline-none font-bold" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade">
            <DynamicSelect name="teacher" label="المحفظ المسؤول" options={dropdownOptions.teachers} placeholder="اختر المحفظ" value={formData.teacher} onChange={handleChange} isManual={manualInputs.teacher} toggleManual={toggleManual} />
            <DynamicSelect name="circle" label="رقم/اسم الحلقة" options={dropdownOptions.circles} placeholder="اختر الحلقة" value={formData.circle} onChange={handleChange} isManual={manualInputs.circle} toggleManual={toggleManual} />
            <div className="space-y-3">
              <label className="text-[12px] font-black text-[#84754E] uppercase pr-1 tracking-[0.2em]">المستوى الدراسي</label>
              <select name="level" value={formData.level || ''} onChange={handleChange} className="w-full px-7 py-5 bg-[#F9F9F9] rounded-2xl outline-none font-bold text-right appearance-none shadow-sm cursor-pointer border border-transparent focus:bg-white focus:border-[#84754E]/20">
                <option value="">اختر المستوى</option>
                {LEVEL_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[12px] font-black text-[#84754E] uppercase pr-1 tracking-[0.2em]">الجزء الحالي (1-30)</label>
              <input name="part" type="number" min="1" max="30" value={formData.part || ''} onChange={handleChange} className="w-full px-7 py-5 bg-[#F9F9F9] rounded-2xl outline-none font-bold" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade">
            <div className="space-y-3">
              <label className="text-[12px] font-black text-[#84754E] uppercase pr-1 tracking-[0.2em]">رقم الهوية / الإقامة</label>
              <input name="nationalId" type="text" value={formData.nationalId || ''} onChange={handleChange} className="w-full px-7 py-5 bg-[#F9F9F9] rounded-2xl outline-none font-bold" placeholder="10xxxxxxxx" />
            </div>
            <DynamicSelect name="category" label="فئة الدارس" options={dropdownOptions.categories} placeholder="اختر الفئة" value={formData.category} onChange={handleChange} isManual={manualInputs.category} toggleManual={toggleManual} />
            <div className="space-y-6 md:col-span-2 pt-10 text-center">
              <label className="text-[14px] font-black text-[#84754E] uppercase mb-6 block tracking-[0.3em]">تأكيد حالة سداد الرسوم</label>
              <div className="flex gap-6 justify-center max-w-2xl mx-auto">
                {['نعم', 'لا'].map(option => (
                  <button key={option} type="button" onClick={() => setFormData(p => ({ ...p, fees: option }))}
                    className={`flex-1 py-6 rounded-2xl font-black text-xl transition-all border-2 ${formData.fees === option ? 'bg-[#84754E] text-white border-[#84754E] shadow-xl scale-[1.02]' : 'bg-[#F9F9F9] text-[#AAA] border-transparent hover:bg-[#F4F1EA]'}`}>
                    {option === 'نعم' ? 'تم السداد' : 'مطلوب السداد'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-16 border-t border-[#F5F5F5]">
          <button type="button" onClick={onCancel} className="text-[#AAA] font-black text-sm hover:text-rose-500 transition-colors uppercase tracking-[0.2em]">إلغاء العملية</button>
          <div className="flex gap-6">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-12 py-5 bg-[#F9F9F9] text-[#777] border border-[#EBEBEB] rounded-2xl font-black text-sm hover:bg-white transition-all uppercase tracking-widest">السابق</button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="px-14 py-5 btn-gold rounded-2xl font-black text-sm shadow-xl uppercase tracking-widest">المتابعة</button>
            ) : (
              <button onClick={handleFinalSubmit} disabled={isSaving} className={`px-16 py-5 rounded-2xl font-black text-sm shadow-xl transition-all uppercase tracking-widest ${isSaving ? 'bg-[#EADBC8] cursor-not-allowed' : 'btn-gold'}`}>
                {isSaving ? 'جاري الحفظ...' : 'إتمام التسجيل'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isSaving && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[50]">
          <div className="bg-[#84754E] text-white px-12 py-6 rounded-3xl shadow-2xl flex items-center gap-6 animate-bounce">
            <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-black text-sm uppercase tracking-[0.3em]">جاري حفظ المعلومات سحابياً...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStudentForm;
