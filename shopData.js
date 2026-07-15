(function(global){
  const UPGRADE_LEVEL_PRICES = [2500, 5000, 10000];
  const TECHNIQUE_LEVEL_PRICES = [5000, 10000, 15000];

  const SHOP_PRICES = {
    upgrades: {
      damage: UPGRADE_LEVEL_PRICES,
      rate: UPGRADE_LEVEL_PRICES,
      speed: UPGRADE_LEVEL_PRICES,
      hp: UPGRADE_LEVEL_PRICES,
      bullets: UPGRADE_LEVEL_PRICES
    },
    techniques: {
      shield: TECHNIQUE_LEVEL_PRICES,
      kienzan: TECHNIQUE_LEVEL_PRICES,
      kiExplosion: TECHNIQUE_LEVEL_PRICES,
      dodonpa: TECHNIQUE_LEVEL_PRICES,
      absorbki: TECHNIQUE_LEVEL_PRICES,
      kamehameha: TECHNIQUE_LEVEL_PRICES,
      dragonDash: 20000,
      muten: 20000
    },
    skins: {
      Yamcha: 10,
      Krilin: 5000,
      TenShinHan: 5000,
      Gohan: 5000,
      Piccolo: 10000,
      Trunks: 10000,
      TrunksSSJ: 10000,
      VegetaSSJ: 10000,
      GohanSSJ: 10000,
      GohanPotencialDesatado: 30000,
      Gotrunks: 30000,
      GotrunksSSJ: 30000,
      GotrunksSSJ3: 30000,
      GogetaSSJ: 30000,
      VegetaSSJBlue: 50000,
      GogetaSSJBlue: 50000,
      GohanBeast: 100000,
      OrangePiccolo: 100000,
      VegetaUltraEgo: 100000
    }
  };

  const shopData = {
    upgrades: [
      {
        id: 'damage',
        nombre: 'Dano',
        categoria: 'upgrades',
        descripcion: 'Mejora permanente equivalente a la mejora de dano al subir de nivel.',
        preciosPorNivel: SHOP_PRICES.upgrades.damage,
        nivelMaximo: 999999
      },
      {
        id: 'rate',
        nombre: 'Cadencia',
        categoria: 'upgrades',
        descripcion: 'Mejora permanente equivalente a la mejora de cadencia al subir de nivel.',
        preciosPorNivel: SHOP_PRICES.upgrades.rate,
        nivelMaximo: 5
      },
      {
        id: 'speed',
        nombre: 'Velocidad',
        categoria: 'upgrades',
        descripcion: 'Mejora permanente equivalente a la mejora de velocidad al subir de nivel.',
        preciosPorNivel: SHOP_PRICES.upgrades.speed,
        nivelMaximo: 5
      },
      {
        id: 'hp',
        nombre: 'Vida',
        categoria: 'upgrades',
        descripcion: 'Mejora permanente equivalente a la mejora de vida al subir de nivel.',
        preciosPorNivel: SHOP_PRICES.upgrades.hp,
        nivelMaximo: 10
      },
      {
        id: 'bullets',
        nombre: 'Disparos',
        categoria: 'upgrades',
        descripcion: 'Mejora permanente equivalente a la mejora de disparos al subir de nivel.',
        preciosPorNivel: SHOP_PRICES.upgrades.bullets,
        nivelMaximo: 2
      }
    ],
    techniques: [
      {
        id: 'shield',
        nombre: 'Escudo',
        categoria: 'techniques',
        descripcion: 'Tecnica superior de proteccion orbital.',
        preciosPorNivel: SHOP_PRICES.techniques.shield,
        nivelMaximo: 3
      },
      {
        id: 'kienzan',
        nombre: 'Kienzan',
        categoria: 'techniques',
        descripcion: 'Tecnica superior de discos de energia.',
        preciosPorNivel: SHOP_PRICES.techniques.kienzan,
        nivelMaximo: 3
      },
      {
        id: 'kiExplosion',
        nombre: 'Explosion de Ki',
        categoria: 'techniques',
        descripcion: 'Tecnica superior de explosion radial de Ki.',
        preciosPorNivel: SHOP_PRICES.techniques.kiExplosion,
        nivelMaximo: 3
      },
      {
        id: 'dodonpa',
        nombre: 'Dodonpa',
        categoria: 'techniques',
        descripcion: 'Tecnica superior de rayo concentrado.',
        preciosPorNivel: SHOP_PRICES.techniques.dodonpa,
        nivelMaximo: 3
      },
      {
        id: 'absorbki',
        nombre: 'Absorber Ki',
        categoria: 'techniques',
        descripcion: 'Tecnica superior de absorcion defensiva de Ki.',
        preciosPorNivel: SHOP_PRICES.techniques.absorbki,
        nivelMaximo: 3
      },
      {
        id: 'kamehameha',
        nombre: 'Kamehameha',
        categoria: 'techniques',
        descripcion: 'Tecnica superior de ataque de energia Kamehameha.',
        preciosPorNivel: SHOP_PRICES.techniques.kamehameha,
        nivelMaximo: 3
      },
      {
        id: 'dragonDash',
        nombre: 'Acometida del Dragon',
        categoria: 'techniques',
        descripcion: 'Tecnica superior de acometida rapida lateral.',
        precio: SHOP_PRICES.techniques.dragonDash,
        nivelMaximo: 1
      },
      {
        id: 'muten',
        nombre: 'Concentracion de Muten Roshi',
        categoria: 'techniques',
        descripcion: 'Tecnica superior de concentracion para el combate.',
        precio: SHOP_PRICES.techniques.muten,
        nivelMaximo: 1
      }
    ],
    skins: [
      {
        id: 'GogetaSSJ',
        nombre: 'GogetaSSJ',
        categoria: 'skins',
        descripcion: 'Skin GogetaSSJ.',
        precio: SHOP_PRICES.skins.GogetaSSJ,
        nivelMaximo: 1
      },
      {
        id: 'GogetaSSJBlue',
        nombre: 'GogetaSSJBlue',
        categoria: 'skins',
        descripcion: 'Skin GogetaSSJBlue.',
        precio: SHOP_PRICES.skins.GogetaSSJBlue,
        nivelMaximo: 1
      },
      {
        id: 'Gohan',
        nombre: 'Gohan',
        categoria: 'skins',
        descripcion: 'Skin Gohan.',
        precio: SHOP_PRICES.skins.Gohan,
        nivelMaximo: 1
      },
      {
        id: 'GohanBeast',
        nombre: 'GohanBeast',
        categoria: 'skins',
        descripcion: 'Skin GohanBeast.',
        precio: SHOP_PRICES.skins.GohanBeast,
        nivelMaximo: 1
      },
      {
        id: 'GohanPotencialDesatado',
        nombre: 'GohanPotencialDesatado',
        categoria: 'skins',
        descripcion: 'Skin GohanPotencialDesatado.',
        precio: SHOP_PRICES.skins.GohanPotencialDesatado,
        nivelMaximo: 1
      },
      {
        id: 'GohanSSJ',
        nombre: 'GohanSSJ',
        categoria: 'skins',
        descripcion: 'Skin GohanSSJ.',
        precio: SHOP_PRICES.skins.GohanSSJ,
        nivelMaximo: 1
      },
      {
        id: 'Gotrunks',
        nombre: 'Gotrunks',
        categoria: 'skins',
        descripcion: 'Skin Gotrunks.',
        precio: SHOP_PRICES.skins.Gotrunks,
        nivelMaximo: 1
      },
      {
        id: 'GotrunksSSJ',
        nombre: 'GotrunksSSJ',
        categoria: 'skins',
        descripcion: 'Skin GotrunksSSJ.',
        precio: SHOP_PRICES.skins.GotrunksSSJ,
        nivelMaximo: 1
      },
      {
        id: 'GotrunksSSJ3',
        nombre: 'GotrunksSSJ3',
        categoria: 'skins',
        descripcion: 'Skin GotrunksSSJ3.',
        precio: SHOP_PRICES.skins.GotrunksSSJ3,
        nivelMaximo: 1
      },
      {
        id: 'Krilin',
        nombre: 'Krilin',
        categoria: 'skins',
        descripcion: 'Skin Krilin.',
        precio: SHOP_PRICES.skins.Krilin,
        nivelMaximo: 1
      },
      {
        id: 'OrangePiccolo',
        nombre: 'OrangePiccolo',
        categoria: 'skins',
        descripcion: 'Skin OrangePiccolo.',
        precio: SHOP_PRICES.skins.OrangePiccolo,
        nivelMaximo: 1
      },
      {
        id: 'Piccolo',
        nombre: 'Piccolo',
        categoria: 'skins',
        descripcion: 'Skin Piccolo.',
        precio: SHOP_PRICES.skins.Piccolo,
        nivelMaximo: 1
      },
      {
        id: 'TenShinHan',
        nombre: 'TenShinHan',
        categoria: 'skins',
        descripcion: 'Skin TenShinHan.',
        precio: SHOP_PRICES.skins.TenShinHan,
        nivelMaximo: 1
      },
      {
        id: 'Trunks',
        nombre: 'Trunks',
        categoria: 'skins',
        descripcion: 'Skin Trunks.',
        precio: SHOP_PRICES.skins.Trunks,
        nivelMaximo: 1
      },
      {
        id: 'TrunksSSJ',
        nombre: 'TrunksSSJ',
        categoria: 'skins',
        descripcion: 'Skin TrunksSSJ.',
        precio: SHOP_PRICES.skins.TrunksSSJ,
        nivelMaximo: 1
      },
      {
        id: 'VegetaSSJ',
        nombre: 'VegetaSSJ',
        categoria: 'skins',
        descripcion: 'Skin VegetaSSJ.',
        precio: SHOP_PRICES.skins.VegetaSSJ,
        nivelMaximo: 1
      },
      {
        id: 'VegetaSSJBlue',
        nombre: 'VegetaSSJBlue',
        categoria: 'skins',
        descripcion: 'Skin VegetaSSJBlue.',
        precio: SHOP_PRICES.skins.VegetaSSJBlue,
        nivelMaximo: 1
      },
      {
        id: 'VegetaUltraEgo',
        nombre: 'VegetaUltraEgo',
        categoria: 'skins',
        descripcion: 'Skin VegetaUltraEgo.',
        precio: SHOP_PRICES.skins.VegetaUltraEgo,
        nivelMaximo: 1
      },
      {
        id: 'Yamcha',
        nombre: 'Yamcha',
        categoria: 'skins',
        descripcion: 'Skin Yamcha.',
        precio: SHOP_PRICES.skins.Yamcha,
        nivelMaximo: 1
      }
    ]
  };

  global.SHOP_PRICES = SHOP_PRICES;
  global.shopData = shopData;
})(window);
