
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
    <div className="space-y-2">
      <label className="text-[11px] font-black text-[#84754E] uppercase pr-1 tracking-wider">{label}</label>
      {isManual ? (
        <div className="relative animate-fade">
          <input 
            name={name} 
            type="text" 
            value={value || ''} 
            onChange={onChange}
            onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }}
            placeholder={`إدخال ${label}...`}
            className="w-full px-5 py-4 bg-[#F9F9F9] border-2 border-[#84754E]/20 rounded-xl outline-none font-bold text-[#444] shadow-inner focus:border-[#84754E] transition-all"
            autoFocus
          />
          <button type="button" onClick={() => toggleManual(name, false)} className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] bg-white text-[#84754E] px-3 py-1.5 rounded-lg shadow-sm font-black border border-[#EDEDED]">عودة</button>
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
            className="w-full px-6 py-4 bg-[#F9F9F9] border border-transparent rounded-xl outline-none font-bold appearance-none cursor-pointer hover:bg-white focus:bg-white focus:border-[#84754E]/20 transition-all text-right text-[#444] shadow-sm"
          >
            <option value="">{placeholder}</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            <option value="__MANUAL__" className="text-[#84754E] font-black">+ إضافة قيمة جديدة</option>
          </select>
          <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#84754E]/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
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
    <div className={`max-w-4xl mx-auto bg-white rounded-3xl border border-[#EDEDED] shadow-xl overflow-hidden mb-12 relative transition-all ${isSaving ? 'opacity-70 scale-[0.99]' : ''}`}>
      <div className="bg-[#84754E] p-10 text-white relative">
        <div className="absolute top-0 right-0 w-full h-1 bg-white/10">
          <div className="h-full bg-white transition-all duration-1000" style={{ width: formData.completion }}></div>
        </div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-2xl font-black mb-1">تسجيل دارس جديد</h3>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">نسبة اكتمال المعلومات: {formData.completion}</p>
          </div>
          <div className="flex gap-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s ? 'bg-white text-[#84754E]' : 'bg-white/10 text-white/40'}`}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-12 space-y-10">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#84754E] uppercase pr-1 tracking-wider">اسم الدارس رباعياً</label>
              <input name="name" type="text" value={formData.name || ''} onChange={handleChange} className="w-full px-6 py-4 bg-[#F9F9F9] rounded-xl outline-none font-bold border border-transparent focus:border-[#84754E]/10" placeholder="أدخل الاسم..." />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#84754E] uppercase pr-1 tracking-wider">رقم الهاتف النشط</label>
              <input name="phone" type="text" value={formData.phone || ''} onChange={handleChange} className="w-full px-6 py-4 bg-[#F9F9F9] rounded-xl outline-none font-bold border border-transparent focus:border-[#84754E]/10" placeholder="05xxxxxxxx" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#84754E] uppercase pr-1 tracking-wider">تاريخ الميلاد</label>
                <input name="dob" type="date" value={formData.dob || ''} onChange={handleChange} className="w-full px-4 py-4 bg-[#F9F9F9] rounded-xl outline-none font-bold text-right" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#84754E] uppercase pr-1 tracking-wider">العمر</label>
                <input name="age" type="text" value={formData.age || ''} readOnly className="w-full px-4 py-4 bg-[#F4F1EA] text-[#84754E] rounded-xl font-black text-center border border-[#EADBC8]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#84754E] uppercase pr-1 tracking-wider">الجنسية</label>
              <input name="nationality" type="text" value={formData.nationality || ''} onChange={handleChange} className="w-full px-6 py-4 bg-[#F9F9F9] rounded-xl outline-none font-bold" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade">
            <DynamicSelect name="teacher" label="المحفظ" options={dropdownOptions.teachers} placeholder="اختر المعلم" value={formData.teacher} onChange={handleChange} isManual={manualInputs.teacher} toggleManual={toggleManual} />
            <DynamicSelect name="circle" label="الحلقة" options={dropdownOptions.circles} placeholder="اختر الحلقة" value={formData.circle} onChange={handleChange} isManual={manualInputs.circle} toggleManual={toggleManual} />
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#84754E] uppercase pr-1 tracking-wider">المستوى</label>
              <select name="level" value={formData.level || ''} onChange={handleChange} className="w-full px-6 py-4 bg-[#F9F9F9] rounded-xl outline-none font-bold text-right appearance-none shadow-sm cursor-pointer border border-transparent focus:border-[#84754E]/20">
                <option value="">اختر المستوى</option>
                {LEVEL_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#84754E] uppercase pr-1 tracking-wider">الجزء الحالي (1-30)</label>
              <input name="part" type="number" min="1" max="30" value={formData.part || ''} onChange={handleChange} className="w-full px-6 py-4 bg-[#F9F9F9] rounded-xl outline-none font-bold" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#84754E] uppercase pr-1 tracking-wider">رقم الهوية / الإقامة</label>
              <input name="nationalId" type="text" value={formData.nationalId || ''} onChange={handleChange} className="w-full px-6 py-4 bg-[#F9F9F9] rounded-xl outline-none font-bold" placeholder="10xxxxxxxx" />
            </div>
            <DynamicSelect name="category" label="فئة الدارس" options={dropdownOptions.categories} placeholder="اختر الفئة" value={formData.category} onChange={handleChange} isManual={manualInputs.category} toggleManual={toggleManual} />
            <div className="space-y-4 md:col-span-2 pt-8 text-center">
              <label className="text-[12px] font-black text-[#84754E] uppercase mb-4 block">حالة سداد الرسوم</label>
              <div className="flex gap-4 justify-center">
                {['نعم', 'لا'].map(option => (
                  <button key={option} type="button" onClick={() => setFormData(p => ({ ...p, fees: option }))}
                    className={`flex-1 max-w-xs py-5 rounded-2xl font-black text-lg transition-all border-2 ${formData.fees === option ? 'bg-[#84754E] text-white border-[#84754E] shadow-lg' : 'bg-[#F9F9F9] text-[#999] border-transparent hover:bg-[#F4F1EA]'}`}>
                    {option === 'نعم' ? 'تم السداد' : 'مطلوب السداد'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-12 border-t border-[#F5F5F5]">
          <button type="button" onClick={onCancel} className="text-[#AAA] font-black text-sm hover:text-rose-500 transition-colors">إلغاء</button>
          <div className="flex gap-4">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-10 py-4 bg-[#F9F9F9] text-[#666] border border-[#EDEDED] rounded-xl font-black text-sm hover:bg-white transition-all">السابق</button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="px-12 py-4 btn-gold rounded-xl font-black text-sm">المتابعة</button>
            ) : (
              <button onClick={handleFinalSubmit} disabled={isSaving} className={`px-14 py-4 rounded-xl font-black text-sm shadow-md transition-all ${isSaving ? 'bg-[#EADBC8] cursor-not-allowed' : 'btn-gold'}`}>
                {isSaving ? 'جاري الحفظ...' : 'إتمام الحفظ'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentForm;
