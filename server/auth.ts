/** Sites is the authentication boundary: the private Site ingress must strip
 * client-supplied oai-* identity headers and inject the authenticated identity.
 * This Worker must never be exposed through a separate public Worker route. */
export function authenticate(request: Request) {
  const subject=request.headers.get('oai-authenticated-user-id');
  if(!subject || subject!==subject.trim() || subject.length>500 || /[\x00-\x20\x7f,]/.test(subject))throw new Error('Sites authentication required');
  // Email and full name are optional profile data, never identity/role authority.
  // Avoid persisting them when the product only needs the stable user ID.
  return {token:'',clientId:'chatgpt-sites',scopes:[],extra:{subject}};
}
