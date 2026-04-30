export interface Topic {
  id: string;
  name: string;
  phase: 1 | 2;
  importance: 'S' | 'A' | 'B' | 'C';
  exam1_frequency: number;
  exam2_frequency: number;
  exam2_type: '계산형' | '서술형' | '혼합' | '없음';
  priority_score: number;
  order: number;
}

export const CURRICULUM: Topic[] = [
  // Phase 1: 재무회계
  { id:'fa_01', name:'재무보고와 재무제표', phase:1, importance:'A', exam1_frequency:8, exam2_frequency:5, exam2_type:'혼합', priority_score:18, order:1 },
  { id:'fa_02', name:'재고자산', phase:1, importance:'S', exam1_frequency:10, exam2_frequency:7, exam2_type:'계산형', priority_score:24, order:2 },
  { id:'fa_03', name:'유형자산', phase:1, importance:'S', exam1_frequency:9, exam2_frequency:8, exam2_type:'계산형', priority_score:25, order:3 },
  { id:'fa_04', name:'무형자산·투자부동산', phase:1, importance:'A', exam1_frequency:7, exam2_frequency:5, exam2_type:'계산형', priority_score:17, order:4 },
  { id:'fa_05', name:'금융자산', phase:1, importance:'S', exam1_frequency:9, exam2_frequency:6, exam2_type:'계산형', priority_score:21, order:5 },
  { id:'fa_06', name:'금융부채·사채', phase:1, importance:'S', exam1_frequency:8, exam2_frequency:7, exam2_type:'계산형', priority_score:22, order:6 },
  { id:'fa_07', name:'충당부채·우발부채', phase:1, importance:'A', exam1_frequency:6, exam2_frequency:4, exam2_type:'서술형', priority_score:14, order:7 },
  { id:'fa_08', name:'자본', phase:1, importance:'A', exam1_frequency:7, exam2_frequency:5, exam2_type:'혼합', priority_score:17, order:8 },
  { id:'fa_09', name:'수익인식(IFRS 15)', phase:1, importance:'S', exam1_frequency:8, exam2_frequency:7, exam2_type:'계산형', priority_score:22, order:9 },
  { id:'fa_10', name:'리스(IFRS 16)', phase:1, importance:'A', exam1_frequency:6, exam2_frequency:5, exam2_type:'계산형', priority_score:16, order:10 },
  { id:'fa_11', name:'법인세회계(이연법인세)', phase:1, importance:'A', exam1_frequency:5, exam2_frequency:6, exam2_type:'계산형', priority_score:17, order:11 },
  { id:'fa_12', name:'주당이익', phase:1, importance:'B', exam1_frequency:4, exam2_frequency:3, exam2_type:'계산형', priority_score:10, order:12 },
  { id:'fa_13', name:'현금흐름표', phase:1, importance:'A', exam1_frequency:6, exam2_frequency:5, exam2_type:'계산형', priority_score:16, order:13 },
  { id:'fa_14', name:'지분법·관계기업', phase:1, importance:'B', exam1_frequency:3, exam2_frequency:3, exam2_type:'계산형', priority_score:9, order:14 },
  { id:'fa_15', name:'연결재무제표', phase:1, importance:'B', exam1_frequency:2, exam2_frequency:2, exam2_type:'계산형', priority_score:6, order:15 },
  { id:'fa_16', name:'환율변동효과', phase:1, importance:'C', exam1_frequency:2, exam2_frequency:1, exam2_type:'혼합', priority_score:4, order:16 },

  // Phase 2: 세법
  { id:'tax_01', name:'국세기본법', phase:2, importance:'A', exam1_frequency:6, exam2_frequency:0, exam2_type:'서술형', priority_score:6, order:17 },
  { id:'tax_02', name:'소득세법 - 종합소득', phase:2, importance:'S', exam1_frequency:9, exam2_frequency:8, exam2_type:'계산형', priority_score:25, order:18 },
  { id:'tax_03', name:'소득세법 - 금융소득·배당소득', phase:2, importance:'A', exam1_frequency:6, exam2_frequency:5, exam2_type:'계산형', priority_score:16, order:19 },
  { id:'tax_04', name:'소득세법 - 양도소득세', phase:2, importance:'A', exam1_frequency:6, exam2_frequency:4, exam2_type:'계산형', priority_score:14, order:20 },
  { id:'tax_05', name:'법인세법 - 익금·손금', phase:2, importance:'S', exam1_frequency:8, exam2_frequency:8, exam2_type:'계산형', priority_score:24, order:21 },
  { id:'tax_06', name:'법인세법 - 세무조정·소득처분', phase:2, importance:'S', exam1_frequency:7, exam2_frequency:9, exam2_type:'혼합', priority_score:25, order:22 },
  { id:'tax_07', name:'법인세법 - 감가상각·충당금', phase:2, importance:'A', exam1_frequency:6, exam2_frequency:6, exam2_type:'계산형', priority_score:18, order:23 },
  { id:'tax_08', name:'법인세법 - 부당행위계산부인', phase:2, importance:'A', exam1_frequency:5, exam2_frequency:5, exam2_type:'혼합', priority_score:15, order:24 },
  { id:'tax_09', name:'부가가치세법 - 과세거래·공급', phase:2, importance:'S', exam1_frequency:7, exam2_frequency:7, exam2_type:'혼합', priority_score:21, order:25 },
  { id:'tax_10', name:'부가가치세법 - 매입세액공제', phase:2, importance:'S', exam1_frequency:7, exam2_frequency:6, exam2_type:'계산형', priority_score:19, order:26 },
  { id:'tax_11', name:'부가가치세법 - 간이과세·면세', phase:2, importance:'B', exam1_frequency:4, exam2_frequency:3, exam2_type:'서술형', priority_score:10, order:27 },
  { id:'tax_12', name:'상속세·증여세법', phase:2, importance:'B', exam1_frequency:4, exam2_frequency:4, exam2_type:'계산형', priority_score:12, order:28 },
  { id:'tax_13', name:'지방세법', phase:2, importance:'C', exam1_frequency:3, exam2_frequency:0, exam2_type:'없음', priority_score:3, order:29 },
];
