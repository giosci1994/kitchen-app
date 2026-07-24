const fs = require('fs');

const markdownContent = fs.readFileSync('C:\\Users\\giova\\Downloads\\RECIPE BOOK CIRCOLO.docx.md', 'utf8');

const TRANSLATION_MAP = {
  "cannellini beans": "Fagioli cannellini",
  "rosemary": "Rosmarino",
  "garlic": "Aglio",
  "sage": "Salvia",
  "salt": "Sale",
  "fine salt": "Sale fino",
  "maldon salt": "Sale Maldon",
  "olive oil": "Olio d'oliva",
  "oil": "Olio d'oliva",
  "bread": "Pane",
  "black pepper": "Pepe nero",
  "toasted black pepper": "Pepe nero",
  "whole black pepper": "Pepe nero in grani",
  "pepper": "Pepe nero",
  "fresh thyme": "Timo",
  "thyme": "Timo",
  "chicken liver": "Fegatini di pollo",
  "red onions": "Cipolle rosse",
  "cipolla": "Cipolle",
  "onions": "Cipolle",
  "baby onions": "Cipolline",
  "vin santo": "Vin Santo",
  "capers": "Capperi",
  "anchovies": "Acciughe",
  "acciughe": "Acciughe",
  "butter": "Burro",
  "soft butter": "Burro",
  "flour \"00\"": "Farina 00",
  "flour 00": "Farina 00",
  "flour “00”": "Farina 00",
  "flour “00” w160": "Farina 00 W160",
  "flour nuvola": "Farina Nuvola",
  "rice flour": "Farina di riso",
  "flour": "Farina",
  "cheeckpeas flour": "Farina di ceci",
  "manitoba": "Farina Manitoba",
  "semolina flour": "Semola",
  "butter and flour": "Burro e farina",
  "fresh milk": "Latte",
  "milk": "Latte",
  "powdered milk": "Latte in polvere",
  "sugar": "Zucchero",
  "icing sugar": "Zucchero a velo",
  "icing sugar to shape the biscuits": "Zucchero a velo",
  "cane sugar": "Zucchero di canna",
  "fructose": "Fruttosio",
  "glucose": "Glucosio",
  "dextrose": "Destrosio",
  "destrose": "Destrosio",
  "malt": "Malto",
  "dried yeast": "Lievito di birra secco",
  "dry yeast": "Lievito di birra secco",
  "baking powder": "Lievito in polvere",
  "water": "Acqua",
  "acqua": "Acqua",
  "cold water": "Acqua fredda",
  "beef fat": "Grasso di manzo",
  "pork fat": "Grasso di maiale",
  "spice mix": "Mix di spezie",
  "lemon zest": "Scorza di limone",
  "lemons zest": "Scorza di limone",
  "lemon juice": "Succo di limone",
  "salted lemon paste": "Pasta di limone salata",
  "lemon": "Limone",
  "orange zest": "Scorza d'arancia",
  "orange juice": "Succo d'arancia",
  "orange": "Arancia",
  "orange blossom water": "Acqua ai fiori d'arancio",
  "parsley": "Prezzemolo",
  "chopped parsley": "Prezzemolo",
  "parsley stem": "Gambi di prezzemolo",
  "1 egg": "Uova",
  "egg": "Uova",
  "eggs": "Uova",
  "hole eggs": "Uova",
  "egg yolk": "Tuorlo d'uovo",
  "cooked pork head": "Coppa di testa di maiale (cotta)",
  "aglio cotto": "Aglio",
  "dried garlic": "Aglio",
  "chopped garlic": "Aglio",
  "fermented chilies": "Peperoncini fermentati",
  "chili flakes": "Peperoncino frantumato",
  "chili": "Peperoncino",
  "rabbit": "Coniglio",
  "bay leaves": "Alloro",
  "bay leaf": "Alloro",
  "fresh bay leaves": "Alloro",
  "bay leaves oil (recipe below)": "Olio all'alloro",
  "juniper": "Ginepro",
  "sunflower oil": "Olio di semi di girasole",
  "rennet (caglio)": "Caglio",
  "vegetables": "Verdure miste",
  "beschamel": "Besciamella",
  "nutmeg": "Noce moscata",
  "parmesan": "Parmigiano Reggiano",
  "grated parmesan": "Parmigiano Reggiano grattugiato",
  "carrots": "Carote",
  "celery": "Sedano",
  "red wine": "Vino rosso",
  "wine": "Vino rosso",
  "white wine": "Vino bianco",
  "withe wine": "Vino bianco",
  "tomato": "Pomodori",
  "tomatoes paste": "Concentrato di pomodoro",
  "tomato can": "Pomodori pelati",
  "frozen peas": "Piselli surgelati",
  "pine nuts": "Pinoli",
  "pinenuts": "Pinoli",
  "black kale cooked": "Cavolo nero cotto",
  "roasted almonds": "Mandorle tostate",
  "whole almonds": "Mandorle intere",
  "pealed almonds": "Mandorle pelate",
  "veggies stock": "Brodo vegetale",
  "lesso stock": "Brodo di carne (lesso)",
  "basil (leaves)": "Basilico",
  "cream": "Panna fresca",
  "wildgame meat": "Carne di selvaggina",
  "mixed lesso meat": "Carne mista per lesso",
  "fish bones": "Lische di pesce",
  "challote": "Scalogno",
  "shallots": "Scalogno",
  "baked and mashed potatoes": "Patate cotte e schiacciate",
  "potatoes": "Patate",
  "ricotta": "Ricotta",
  "sautéd spinach": "Spinaci saltati",
  "chopped spinaches": "Spinaci",
  "cooked spinach(or other greens)": "Spinaci cotti",
  "pork ribs": "Costine di maiale",
  "salt/sugar (70/30)": "Sale e Zucchero (70/30)",
  "fennel seeds": "Semi di finocchio",
  "vodka": "Vodka",
  "beer": "Birra",
  "breadcrumb": "Pangrattato",
  "cauliflower": "Cavolfiore",
  "fennels": "Finocchi",
  "vinegar": "Aceto",
  "capriollo": "Capriolo",
  "raisins": "Uvetta",
  "candied cedar": "Cedro candito",
  "chocolate": "Cioccolato",
  "cocoa powder": "Cacao in polvere",
  "cocoa": "Cacao in polvere",
  "vanilla": "Vaniglia",
  "vanilla stick": "Bacca di vaniglia",
  "yogurt": "Yogurt",
  "cremodan": "Cremodan",
  "citrus juice": "Succo di agrumi",
  "honey": "Miele",
  "neutral honey": "Miele neutro",
  "mascarpone": "Mascarpone",
  "nocciola paste": "Pasta di nocciole",
  "fresh strawberries": "Fragole fresche",
  "vacuum bags": "Sacchetti sottovuoto",
  "sirup t.p.t.": "Sciroppo T.P.T",
  "pectin": "Pectina",
  "xantana gum": "Gomma xantana",
  "raspberry pure": "Purea di lamponi"
};

function normalizeIngredient(englishName) {
  const lower = englishName.trim().toLowerCase();
  return TRANSLATION_MAP[lower] || englishName.trim();
}

const recipes = [];
const lines = markdownContent.split('\n').map(l => l.trim());

let currentMacroCategory = 'ALTRO';
let currentCategory = 'ALTRO';
let currentRecipeTitle = null;
let currentInstructions = [];
let currentIngredients = [];
let inTable = false;

// Macrocategorie
const CATEGORY_MAP = {
  "STARTERS": "ANTIPASTO",
  "PRIMI": "PRIMO",
  "SECONDI": "SECONDO",
  "SIDES": "CONTORNO",
  "DESSERTS": "DESSERT"
};

function splitQuantity(rawQuantity) {
  if (!rawQuantity || rawQuantity.trim().toLowerCase() === 'q.s.' || rawQuantity.trim().toLowerCase() === 'qb') {
    return { baseQuantity: 0, unit: 'q.s.' };
  }
  
  // Rimuovi spazi extra
  const clean = rawQuantity.trim().replace(/,/g, '.');
  
  // Cerca numero all'inizio
  const match = clean.match(/^([\d\.]+)\s*(.*)?$/);
  if (match) {
    let q = parseFloat(match[1]);
    let u = match[2] ? match[2].trim() : 'pz';
    // Se ci sono cose tipo "3 kg"
    if (u === '') u = 'pz';
    return { baseQuantity: isNaN(q) ? 0 : q, unit: u };
  }
  
  // Non parsabile come numero
  return { baseQuantity: 1, unit: rawQuantity.trim() || 'pz' };
}

function commitRecipe() {
  if (currentRecipeTitle && currentIngredients.length > 0) {
    // Rimuovi numerazioni dal titolo tipo "1. "
    const cleanTitle = currentRecipeTitle.replace(/^[\d\.]+\s*/, '');
    recipes.push({
      title: cleanTitle.toUpperCase(),
      category: currentCategory,
      instructions: currentInstructions.join('\n').trim(),
      ingredients: currentIngredients
    });
  }
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Identifica Macrocategorie
  const catMatch = line.match(/^\*\*([A-Z]+)\*\*$/);
  if (catMatch && CATEGORY_MAP[catMatch[1]]) {
    currentMacroCategory = CATEGORY_MAP[catMatch[1]];
    currentCategory = currentMacroCategory;
    continue;
  }

  // Identifica un titolo (potenziale ricetta)
  // Il formato generale per i titoli di ricette è **Titolo** o **1. Titolo**
  const titleMatch = line.match(/^\*\*(.*)\*\*$/);
  if (titleMatch && !CATEGORY_MAP[titleMatch[1]]) {
    // Un titolo chiude la ricetta precedente se eravamo in una tabella
    if (inTable) {
      commitRecipe();
      inTable = false;
      currentIngredients = [];
      currentInstructions = [];
    }
    
    // Potrebbe essere un titolo primario "1. XXX" che di solito contiene sub-ricette.
    // Ignoriamo la distinzione, usiamo il bold text più vicino ad una tabella.
    currentRecipeTitle = titleMatch[1].trim();
    continue; // continua
  }

  // Controlla l'inizio della tabella
  if (line.includes('| Ingredients') || line.includes('| :----')) {
    if (!inTable) {
      // Inizia nuova tabella/ricetta
      inTable = true;
      currentIngredients = [];
      currentInstructions = [];
    }
    continue;
  }

  // Riga tabella (Ingredienti)
  if (inTable && line.startsWith('|')) {
    // | Cannellini beans  | 750g | Soak beans overnight... |
    // | Rosemary  | 10g  |  |
    const parts = line.split('|').map(s => s.trim());
    if (parts.length >= 4) {
      const rawName = parts[1];
      const rawQuant = parts[2];
      const prep = parts[3];

      if (rawName && rawName.length > 0) {
        const parsedQ = splitQuantity(rawQuant);
        currentIngredients.push({
          rawName: rawName,
          normalizedName: normalizeIngredient(rawName),
          baseQuantity: parsedQ.baseQuantity,
          unit: parsedQ.unit
        });
      }

      if (prep && prep.length > 0) {
        currentInstructions.push(prep);
      }
    }
  } else if (inTable && !line.startsWith('|') && line.trim() === '') {
    // Tabella finita
    commitRecipe();
    inTable = false;
    currentIngredients = [];
    currentInstructions = [];
    currentRecipeTitle = null;
  }
}

// In caso di file terminante direttamente dopo tabella
if (inTable) {
  commitRecipe();
}

fs.writeFileSync('parsed_recipes.json', JSON.stringify(recipes, null, 2));

// Estrai elenco ingredienti unici (per test)
const uniqueIngredients = [...new Set(recipes.flatMap(r => r.ingredients.map(i => i.normalizedName)))];
console.log('Ricette lette:', recipes.length);
console.log('Ingredienti unici:', uniqueIngredients.length);
