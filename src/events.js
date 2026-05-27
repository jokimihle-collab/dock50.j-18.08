// ─── Gemeinsame Event Library ────────────────────────────────────────────────

export const _IMGS = [
  "/event-back2dock.jpg", "/event-jerome.jpg", "/event-sixteenbeats.jpg",
  "/event-strictlyoldschool.jpg", "/event-kuult.jpg", "/doc50-concert-1.jpg",
  "/doc50-concert-2.jpg", "/doc50-concert-3.jpg", "/doc50-concert-5.jpg", "/doc50-concert-6.jpg",
];

export const eventLibrary = {
  skylounge: [
    { artist: "Various Artists", title: "Back2Dock",          date: "14.03.26", past: true,  location: "Skylounge", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[0], desc: "Die traditionelle Back2Dock Nacht kehrt zurück in die DOCK50 Skylounge." },
    { artist: "Jerome",          title: "Jerome",             date: "28.03.26", past: true,  location: "Skylounge", category: "Live Music", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[1], desc: "Jerome bringt seinen unverwechselbaren Sound live auf die Skylounge-Bühne." },
    { artist: "DJ Collective",   title: "Sixteen Beats",      date: "11.04.26", past: true,  location: "Skylounge", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[2], desc: "Das DJ Collective bringt sechzehn Beats, die die Nacht zum Leben erwecken." },
    { artist: "Various DJs",     title: "Strictly Oldschool", date: "18.04.26", past: true,  location: "Skylounge", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[3], desc: "Eine Nacht ganz im Zeichen der klassischen Sounds – Strictly Oldschool." },
    { artist: "Kuult",           title: "Kuult",              date: "09.05.26", past: true,  location: "Skylounge", category: "Live Music", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[4], desc: "Kuult live – emotionale Songs und kraftvolle Bühnenperformance." },
    { artist: "{Infos}", title: "{Infos}", date: "23.05.26", past: true,  location: "Skylounge", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[5], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "06.06.26", past: false, location: "Skylounge", category: "Live Music", hasTicket: false, ticketUrl: "",               image: _IMGS[6], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "20.06.26", past: false, location: "Skylounge", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[7], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "04.07.26", past: false, location: "Skylounge", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[8], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "18.07.26", past: false, location: "Skylounge", category: "Live Music", hasTicket: false, ticketUrl: "",               image: _IMGS[9], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "01.08.26", past: false, location: "Skylounge", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[0], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "15.08.26", past: false, location: "Skylounge", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[1], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "12.09.26", past: false, location: "Skylounge", category: "Live Music", hasTicket: false, ticketUrl: "",               image: _IMGS[2], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "03.10.26", past: false, location: "Skylounge", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[3], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "14.11.26", past: false, location: "Skylounge", category: "Live Music", hasTicket: false, ticketUrl: "",               image: _IMGS[4], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "31.12.26", past: false, location: "Skylounge", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[5], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "10.01.27", past: false, location: "Skylounge", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[6], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "14.02.27", past: false, location: "Skylounge", category: "Live Music", hasTicket: false, ticketUrl: "",               image: _IMGS[7], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "20.03.27", past: false, location: "Skylounge", category: "Live Music", hasTicket: false, ticketUrl: "",               image: _IMGS[8], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "03.04.27", past: false, location: "Skylounge", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[9], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  ],
  deck1: [
    { artist: "{Infos}", title: "{Infos}", date: "07.03.26", past: true,  location: "Deck1", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[5], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "21.03.26", past: true,  location: "Deck1", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[6], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "04.04.26", past: true,  location: "Deck1", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[7], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "19.04.26", past: true,  location: "Deck1", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[8], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "02.05.26", past: true,  location: "Deck1", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[9], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "16.05.26", past: true,  location: "Deck1", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[0], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "30.05.26", past: false, location: "Deck1", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[1], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "13.06.26", past: false, location: "Deck1", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[2], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "27.06.26", past: false, location: "Deck1", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[3], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "11.07.26", past: false, location: "Deck1", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[4], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "25.07.26", past: false, location: "Deck1", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[5], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "08.08.26", past: false, location: "Deck1", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[6], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "19.09.26", past: false, location: "Deck1", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[7], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "10.10.26", past: false, location: "Deck1", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[8], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "21.11.26", past: false, location: "Deck1", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[9], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "31.12.26", past: false, location: "Deck1", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[0], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "17.01.27", past: false, location: "Deck1", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[1], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "21.02.27", past: false, location: "Deck1", category: "Club Night", hasTicket: true,  ticketUrl: "/anfrage.html", image: _IMGS[2], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "27.03.27", past: false, location: "Deck1", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[3], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { artist: "{Infos}", title: "{Infos}", date: "10.04.27", past: false, location: "Deck1", category: "Club Night", hasTicket: false, ticketUrl: "",               image: _IMGS[4], desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  ],
};

export function parseEventDate(str) {
  const [d, m, y] = str.split(".").map(Number);
  return new Date(2000 + y, m - 1, d);
}

export function getNearestN(filter, n = 8) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pool = filter === "all"
    ? [...eventLibrary.skylounge, ...eventLibrary.deck1]
    : (eventLibrary[filter.toLowerCase()] || [...eventLibrary.skylounge, ...eventLibrary.deck1]);
  return pool
    .filter(ev => !ev.past && parseEventDate(ev.date) >= today)
    .sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date))
    .slice(0, n);
}

export function findEvent(loc, date) {
  const arr = eventLibrary[loc?.toLowerCase()] || [];
  return arr.find(ev => ev.date === date) || null;
}
