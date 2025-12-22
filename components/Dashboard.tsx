
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { Student } from '../types';

interface DashboardProps {
  students: Student[];
}

const LEVEL_ORDER = ['تمهيدي', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];

const Dashboard: React.FC<DashboardProps> = ({ students }) => {
  const stats = useMemo(() => {
    const counts = {
      total: students.length,
      nationalities: new Set(students.map(s => s.nationality)).size,
      paid: students.filter(s => s.fees === 'نعم').length,
      teachers: new Set(students.map(s => s.teacher)).size,
    };

    const levelMap = students.reduce((acc: any, curr) => {
      const level = curr.level || 'غير محدد';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const levelChart = LEVEL_ORDER.map(name => ({
      name,
      count: levelMap[name] || 0
    }));

    return { counts, levelChart };
  }, [students]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي الدارسين', value: stats.counts.total, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { label: 'تنوع الجنسيات', value: stats.counts.nationalities, icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 012.5 2.5V17M12.828 4.405l-.01.01M16.5 4.5l.01.01' },
          { label: 'رسوم سددت', value: stats.counts.paid, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'كادر التحفيظ', value: stats.counts.teachers, icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9-5-9 5 9 5zm0 0v6m0 0l4-2.223M12 20l-4-2.223' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-[#EDEDED] shadow-sm hover:border-[#84754E]/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-[#84754E]/5 text-[#84754E] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon}/></svg>
              </div>
            </div>
            <h4 className="text-[#999] text-[10px] font-black mb-1 uppercase tracking-widest">{card.label}</h4>
            <div className="text-4xl font-black text-[#444] tracking-tighter">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white p-10 rounded-3xl border border-[#EDEDED] shadow-sm">
        <h3 className="text-[#84754E] font-black text-lg mb-10 flex items-center gap-3">
            <div className="w-1 h-6 bg-[#84754E] rounded-full"></div>
            مستويات الحلقات الدراسية
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.levelChart}>
              <defs>
                <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84754E" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#84754E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#999' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#999' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: '1px solid #EDEDED', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', padding: '15px' }} 
                itemStyle={{ fontWeight: 800, color: '#84754E' }}
              />
              <Area type="monotone" dataKey="count" stroke="#84754E" strokeWidth={3} fillOpacity={1} fill="url(#colorGold)" dot={{ r: 4, fill: '#84754E', strokeWidth: 2, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
