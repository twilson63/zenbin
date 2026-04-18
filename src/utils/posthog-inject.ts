/**
 * PostHog Web Analytics Injection
 * Injects the PostHog JavaScript snippet into HTML pages for client-side tracking
 */

import { config } from '../config.js';

/**
 * Generate the PostHog JavaScript snippet
 */
function generatePostHogSnippet(): string {
  if (!config.posthogKey) {
    return '';
  }

  return `<script>
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([Array.prototype.slice.call(arguments)])}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",e._i.push(i),e.init=function(t,e,o){e&&(u[e]=[]),g(u,"init"),g(u,"set_config"),g(u,"identify"),g(u,"alias"),g(u,"capture"),g(u,"group"),g(u,"set_group"),g(u,"reset"),g(u,"register"),g(u,"unregister"),g(u,"register_once"),g(u,"set_config",!1),g(u,"opt_in_capture",!1),g(u,"opt_out_capture",!1)},e.init(i,s,a)},e.__SV=1)}(document,window.posthog||[]);
posthog.init('${config.posthogKey}', {api_host: '${config.posthogHost}'})
</script>`;
}

/**
 * Inject PostHog snippet into HTML content
 * Inserts it at the end of the <head> tag, or at the beginning of the document if no <head>
 */
export function injectPostHog(html: string): string {
  // Only inject if PostHog is configured
  if (!config.posthogKey) {
    return html;
  }

  const snippet = generatePostHogSnippet();
  
  // Try to inject at the end of <head>
  const headMatch = html.match(/<\/head>/i);
  if (headMatch) {
    const insertIndex = headMatch.index!;
    return html.slice(0, insertIndex) + snippet + '\n' + html.slice(insertIndex);
  }

  // Try to inject after <html> if no <head>
  const htmlTagMatch = html.match(/<html[^>]*>/i);
  if (htmlTagMatch) {
    const insertIndex = htmlTagMatch.index! + htmlTagMatch[0].length;
    return html.slice(0, insertIndex) + '\n' + snippet + '\n' + html.slice(insertIndex);
  }

  // Fallback: prepend to document
  return snippet + '\n' + html;
}

/**
 * Check if HTML should have PostHog injected
 * We only inject into HTML pages, not images, videos, or raw content
 */
export function shouldInjectPostHog(contentType: string): boolean {
  if (!config.posthogKey) {
    return false;
  }
  
  const htmlTypes = [
    'text/html',
    'application/xhtml+xml',
  ];
  
  return htmlTypes.some(type => contentType.includes(type));
}