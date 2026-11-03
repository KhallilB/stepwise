type CoachTransport = (url: string, init?: RequestInit) => Promise<Response>;
let transport: CoachTransport = (url, init) => fetch(url, init);
export const coachFetch: CoachTransport = (url, init) => transport(url, init);
export function configureCoachTransport(next: CoachTransport) {
  transport = next;
}
