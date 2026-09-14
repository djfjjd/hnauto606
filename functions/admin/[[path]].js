const text=(message,status)=>new Response(message,{status,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});

export async function onRequest(context){
  const configured=String(context.env.ADMIN_EMAIL||'').trim().toLowerCase();
  if(!configured)return text('관리자 이메일 Secret이 설정되지 않았습니다.',503);
  const email=String(context.request.headers.get('CF-Access-Authenticated-User-Email')||'').trim().toLowerCase();
  const assertion=context.request.headers.get('CF-Access-Jwt-Assertion');
  if(!email||!assertion)return text('관리자 이메일 인증이 필요합니다.',401);
  if(email!==configured)return text('관리자 페이지 접근 권한이 없습니다.',403);
  return context.next();
}
