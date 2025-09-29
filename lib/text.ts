export function truncate(s: string, n=12000){ 
  return s.length > n ? s.slice(0,n) : s; 
}
