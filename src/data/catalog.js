export const INITIAL_CATALOGUES = [
  { id: 'Tous', title: 'Tous', subtitle: 'Collection intégrale' },
  { id: 'Bijouterie', title: 'Bijouterie', subtitle: 'Bagues, joncs & anneaux' },
  { id: 'Maroquinerie', title: 'Maroquinerie', subtitle: 'Cuir & étuis RFID' },
  { id: 'Quotidien', title: 'Quotidien', subtitle: 'Parapluies, miroirs & étoles' }
];

export const NAV_TABS = [
  { id: 'boutique', label: 'Boutique' },
  { id: 'fiches', label: 'Fiches' },
  { id: 'studio', label: 'Studio' },
  { id: 'suivi', label: 'Suivi' }
];

const IMG_BASE = 'https://images.unsplash.com/photo-';
const IMG_PARAMS = '?auto=format&fit=crop&w=900&q=85';

export const INITIAL_PRODUCTS = [
  {
    id: 'REF-01',
    name: 'Chevalière Octogonale Gravée',
    category: 'Bijouterie',
    price: 165,
    atelier: 'Plateau 12 × 10 mm · Gravure profonde',
    shortDesc: 'Table octogonale gravée et anneau poli miroir.',
    descriptif:
      'Table octogonale franche avec encadrement poli miroir et ' +
      'monogramme ciselé.',
    images: [
      `${IMG_BASE}1605100804763-247f67b3557e${IMG_PARAMS}`,
      `${IMG_BASE}1599643478518-a784e5dc4c8f${IMG_PARAMS}`
    ],
    variants: [
      { id: 'v1', name: 'Or Champagne', color: '#D4B483' },
      { id: 'v2', name: 'Argent Rhodié', color: '#CFD4DC' }
    ]
  },
  {
    id: 'REF-02',
    name: 'Jonc Ruban Poli',
    category: 'Bijouterie',
    price: 95,
    atelier: 'Largeur 5 mm · Acier 316L',
    shortDesc: 'Bracelet rigide ruban plat à bords adoucis.',
    descriptif:
      'Ruban métallique cintré épousant le poignet avec reflets chauds.',
    images: [
      `${IMG_BASE}1611591437281-460bfbe1220a${IMG_PARAMS}`,
      `${IMG_BASE}1573408301185-9146fe634ad0${IMG_PARAMS}`
    ],
    variants: [
      { id: 'v1', name: 'Bronze Rosé', color: '#C89B7B' },
      { id: 'v2', name: 'Or Pâle', color: '#DFC7A2' }
    ]
  },
  {
    id: 'REF-03',
    name: "Double Anneau d'Oreille",
    category: 'Bijouterie',
    price: 58,
    atelier: 'Diamètre 10 mm · Sans perçage',
    shortDesc: 'Double jonc parallèle en argent poli.',
    descriptif:
      'Double anneau parallèle conçu pour un maintien naturel sans perçage.',
    images: [`${IMG_BASE}1630019852942-f89202989a59${IMG_PARAMS}`],
    variants: [
      { id: 'v1', name: 'Argent', color: '#DCDEE2' },
      { id: 'v2', name: 'Or Pâle', color: '#D8C29D' }
    ]
  },
  {
    id: 'REF-04',
    name: 'Étui Cartes Blindé RFID',
    category: 'Maroquinerie',
    price: 110,
    atelier: '96 × 66 × 13 mm · 10 compartiments',
    shortDesc: 'Coque anti-RFID à ouverture en éventail.',
    descriptif:
      'Boîtier rigide protégeant vos cartes contre les lectures sans contact.',
    images: [`${IMG_BASE}1627123424574-724758594e93${IMG_PARAMS}`],
    variants: [
      { id: 'v1', name: 'Marron Crème', color: '#CBB092' },
      { id: 'v2', name: 'Acier Brossé', color: '#6E737B' }
    ]
  },
  {
    id: 'REF-05',
    name: 'Porte-Cartes Cuir à Tirette',
    category: 'Maroquinerie',
    price: 88,
    atelier: '104 × 72 mm · Cuir pleine fleur',
    shortDesc: 'Étui en cuir grainé avec sangle d’extraction.',
    descriptif:
      'Cuir pleine fleur doublé d’une sangle déployant les cartes en cascade.',
    images: [`${IMG_BASE}1553062407-98eeb64c6a62${IMG_PARAMS}`],
    variants: [
      { id: 'v1', name: 'Cognac', color: '#7D4E35' },
      { id: 'v2', name: 'Expresso', color: '#3B2216' }
    ]
  },
  {
    id: 'REF-06',
    name: 'Parapluie Manche Bois',
    category: 'Quotidien',
    price: 140,
    atelier: 'Envergure 108 cm · Poignée bois',
    shortDesc: 'Toile déperlante et poignée en bois tourné.',
    descriptif:
      'Armature renforcée, toile haute densité et poignée en bois noble.',
    images: [`${IMG_BASE}1515694346937-94d85e41e6f0${IMG_PARAMS}`],
    variants: [
      { id: 'v1', name: 'Noir Obsidienne', color: '#1C130E' },
      { id: 'v2', name: 'Ardoise', color: '#4E545C' }
    ]
  },
  {
    id: 'REF-07',
    name: 'Étole Cachemire Doré',
    category: 'Quotidien',
    price: 155,
    atelier: '190 × 70 cm · Laine & cachemire',
    shortDesc: 'Grande étole ivoire à motifs dorés.',
    descriptif:
      'Maille douce ivoire ornée d’un motif doré et d’une bordure fine.',
    images: [`${IMG_BASE}1584917865442-de89df76afd3${IMG_PARAMS}`],
    variants: [
      { id: 'v1', name: 'Ivoire Or', color: '#EFE7DC' },
      { id: 'v2', name: 'Marron Crème', color: '#DECAB1' }
    ]
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'TR-2026-1089',
    date: '2026-11-12',
    customerMasked: 'Jean M*****',
    amount: 165,
    paymentMethod: 'Mobile Money (USD)',
    step: 3,
    priority: 'important'
  },
  {
    id: 'TR-2026-1094',
    date: '2026-11-14',
    customerMasked: 'Clarisse K*****',
    amount: 250,
    paymentMethod: 'Carte Bancaire',
    step: 1,
    priority: 'crucial'
  }
];

export const INITIAL_MESSAGES = [
  {
    id: 'MSG-101',
    sender: 'Client Kinshasa',
    subject: 'Disponibilité REF-01',
    body: 'Bonjour, la chevalière est-elle livrable sous 24h ?',
    reply: 'Oui, livraison assurée sous 24h.'
  }
];
