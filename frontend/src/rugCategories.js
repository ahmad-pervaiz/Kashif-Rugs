// Stock categories supplied by Kashif Rugs. Keep the supplied names unchanged.
export const RUG_CATEGORY_GROUPS = [
  {
    country: 'Pakistan',
    names: [
      'BOKHARA',
      'JALDAR',
      'KAFKAZI',
      'FLORAL KARACHI',
      'MODERN GABBEH',
      'MODREN ABSTRACT',
      'CHOBI ZIEGLER',
      'BALOUCHI TRIBAL',
      'KILLIM',
      'OSHAK',
      'MOROCCAN',
      'SHAGGY',
      'PAK PERSIAN SOOTRI',
      'BURJUSTA',
      'PICTORIAL RUGS',
    ],
  },
  {
    country: 'Afghanistan',
    names: [
      'HERIZ',
      'MAMLOOK',
      'FARHAN KHRJEEN',
      'SUPER KAZAK',
      'SHERWAN',
      'BELJIK',
      'KHOTAN',
      'SULTANI',
      'PATCH WORK',
      'VINTAGE OVERDYED',
      'KHAL MUHAMMADI',
      'KILLIM',
      'OSHAK',
      'BURJUSTA',
      'ADRASKAN',
      'WAR RUGS',
      'AFGHAN PICTORIAL',
      'TAIMOORI',
      'GUL E AAIENA',
    ],
  },
];

export const RUG_CATEGORIES = RUG_CATEGORY_GROUPS.flatMap(({ country, names }) =>
  names.map(name => ({ name, country, key: `${country}:${name}` }))
);
