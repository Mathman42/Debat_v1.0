import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DebateRequest {
  topic: string;
  standpoint: "VOOR" | "TEGEN";
  userInput?: string;
  isSensitive?: boolean;
  generateSummary?: boolean;
  messages?: Array<{ role: string; content: string; timestamp: string }>;
}

const sensitiveKeywords = [
  'zelfmoord', 'suicide', 'zelfbeschadiging', 'zelfdoding', 'eetstoornis',
  'anorexia', 'boulimia', 'misbruik', 'geweld', 'pesten'
];

function containsSensitiveContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return sensitiveKeywords.some(keyword => lowerText.includes(keyword));
}

function generateSafetyResponse(): string {
  return `Dit onderwerp raakt aan gevoelige thema's waarbij je misschien hulp nodig hebt. Het is belangrijk dat je hierover praat met een vertrouwenspersoon, zoals een docent, mentor, schoolmaatschappelijk werker of je ouders. Je kunt ook contact opnemen met:

- 113 Zelfmoordpreventie: 113 of 0900-0113
- Kindertelefoon: 0800-0432
- je huisarts

Laten we een ander debatonderwerp kiezen waar ik je beter mee kan helpen.`;
}

function generateDebateResponse(req: DebateRequest): string {
  const { topic, standpoint, userInput } = req;

  if (containsSensitiveContent(topic) || containsSensitiveContent(userInput!)) {
    return generateSafetyResponse();
  }

  return getNaturalResponse(topic, standpoint, userInput!);
}

function getNaturalResponse(topic: string, standpoint: string, userInput: string): string {
  const topicLower = topic.toLowerCase();
  const inputLower = userInput.toLowerCase();

  const responses = {
    socialMedia16: {
      voor: [
        "Interessant punt, maar denk je niet dat jongeren juist beschermd moeten worden? Onderzoek laat zien dat intensief social media gebruik leidt tot angst en depressie bij kinderen onder de 16. Hun hersenen zijn gewoon nog niet klaar voor die constante vergelijkingen en cyberpesten.",
        "Dat snap ik, maar vergeet niet dat hun hersenen nog in ontwikkeling zijn. Ze zijn extra kwetsbaar voor verslaving aan likes en notifications. Net zoals we alcohol verbieden voor minderjarigen, kunnen we dit ook doen.",
        "Oké, maar hoe verklaar je dan dat één op de vijf jongeren mentale problemen ervaart door social media? Australië overweegt daarom ook een verbod. Moeten we gewoon toekijken terwijl een hele generatie kampt met angststoornissen?"
      ],
      tegen: [
        "Wacht even, wie zegt dat een verbod de oplossing is? In China probeerden ze gaming te beperken voor jongeren, maar die vonden massaal manieren om het te omzeilen. Een verbod werkt gewoon niet in de praktijk.",
        "Dat klinkt mooi in theorie, maar hoe ga je dat handhaven? Jongeren kunnen makkelijk een valse leeftijd opgeven. En trouwens, sommige jongeren gebruiken social media juist voor steun en om vriendschappen te onderhouden.",
        "Maar dan los je het echte probleem niet op. Het gaat niet om social media zelf, maar om mediawijsheid en begeleiding. Als je het verbiedt, leren jongeren nooit hoe ze er verantwoord mee om moeten gaan."
      ]
    },
    schooluniform: {
      voor: [
        "Misschien, maar denk je niet dat het pestprobleem kleiner wordt als iedereen hetzelfde draagt? Op veel Britse scholen met uniformen zie je minder pesten op basis van kleding en merkjes.",
        "Dat begrijp ik, maar het gaat om het grotere plaatje. Uniformen zorgen voor gelijkheid en verminderen de druk om dure merkkleding te kopen. Niet iedereen kan zich dat veroorloven.",
        "Klopt, maar op school draait het om leren, niet om een modeshow. Leerlingen kunnen zich na schooltijd genoeg uiten met hun kleding."
      ],
      tegen: [
        "Ja, maar dan negeer je het recht op zelfexpressie. Juist in de puberteit is het belangrijk dat jongeren hun identiteit kunnen ontwikkelen, en kleding is daar een deel van.",
        "Dat klinkt goed, maar uniformen kosten ook gewoon geld. Niet alle gezinnen kunnen zich die extra uitgave veroorloven, dus je lost het financiële probleem niet echt op.",
        "Misschien in theorie, maar in de praktijk vinden leerlingen altijd manieren om verschillen te tonen via schoenen, tassen of andere accessoires. Pesten verdwijnt niet door een uniform."
      ]
    },
    huiswerk: {
      voor: [
        "Interessant, maar als huiswerk zo belangrijk is, waarom scoren Finse leerlingen dan zo hoog terwijl ze bijna geen huiswerk krijgen? Het werkt blijkbaar ook zonder.",
        "Dat zeg je, maar huiswerk vergroot juist de ongelijkheid. Kinderen met hulp thuis presteren beter, terwijl anderen het alleen moeten doen. Is dat eerlijk?",
        "Oké, maar kunnen leerlingen die vaardigheden niet ook tijdens schooltijd leren? Dan is er tenminste gelijke begeleiding voor iedereen en hebben ze thuis tijd voor sport en ontspanning."
      ],
      tegen: [
        "Dat snap ik, maar zonder huiswerk hoe gaan leerlingen dan de stof oefenen en verdiepen? Je kunt niet alles in de klas leren, soms moet je thuis verder.",
        "Misschien, maar huiswerk bereidt je voor op later. Op de universiteit en in je baan moet je ook zelfstandig werken. Hoe leer je dat als je nooit huiswerk hebt gedaan?",
        "Klopt dat er stress kan zijn, maar bij een goede balans hoeft huiswerk helemaal niet overdreven te zijn. Landen zoals Singapore met huiswerk presteren ook uitstekend."
      ]
    }
  };

  let topicResponses = null;
  if (topicLower.includes('sociale media') && topicLower.includes('16')) {
    topicResponses = responses.socialMedia16;
  } else if (topicLower.includes('schooluniform')) {
    topicResponses = responses.schooluniform;
  } else if (topicLower.includes('huiswerk')) {
    topicResponses = responses.huiswerk;
  }

  if (topicResponses) {
    const responseList = standpoint === 'VOOR' ? topicResponses.voor : topicResponses.tegen;
    const randomIndex = Math.floor(Math.random() * responseList.length);
    return responseList[randomIndex];
  }

  return getGenericNaturalResponse(standpoint, inputLower);
}

function getGenericNaturalResponse(standpoint: string, inputLower: string): string {
  if (standpoint === 'VOOR') {
    const responses = [
      "Interessant punt, maar heb je nagedacht over het maatschappelijk belang? Deze maatregel kan echt bijdragen aan een betere samenleving voor iedereen.",
      "Dat snap ik, maar in de praktijk kan dit juist leiden tot concrete verbeteringen. We moeten verder kijken dan alleen de korte termijn.",
      "Oké, maar door nu te handelen bereiden we ons voor op de toekomst. Is het niet beter om proactief te zijn dan reactief?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  } else {
    const responses = [
      "Wacht even, maar dan beperk je wel de persoonlijke vrijheid van mensen. Moeten zij niet zelf kunnen beslissen zonder teveel overheidsbemoeienis?",
      "Dat klinkt goed, maar zulke maatregelen leiden vaak tot onvoorziene negatieve effecten. Heb je daarover nagedacht?",
      "Misschien, maar zijn er niet minder ingrijpende manieren om hetzelfde doel te bereiken? Een verbod lijkt me te drastisch."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

interface SummaryData {
  userArguments: string[];
  coachArguments: string[];
  performanceScore: number;
  feedback: string;
}

function generateSummary(messages: Array<{ role: string; content: string }>, userStandpoint: string): SummaryData {
  const userMessages = messages.filter(m => m.role === 'user');
  const coachMessages = messages.filter(m => m.role === 'coach');

  const userArguments: string[] = [];
  const coachArguments: string[] = [];

  for (const msg of userMessages) {
    const content = msg.content.trim();
    if (content.length > 20) {
      const summary = content.length > 100 ? content.substring(0, 97) + '...' : content;
      userArguments.push(summary);
    }
  }

  for (const msg of coachMessages) {
    const content = msg.content.trim();
    if (content.length > 20 && !content.includes('Welkom bij dit debat')) {
      const summary = content.length > 120 ? content.substring(0, 117) + '...' : content;
      coachArguments.push(summary);
    }
  }

  let score = 5;
  const turnCount = userMessages.length;

  if (turnCount >= 5) score += 1;
  if (turnCount >= 8) score += 1;

  const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
  if (avgLength > 100) score += 1;
  if (avgLength > 200) score += 1;

  score = Math.min(10, Math.max(4, score));

  let feedback = '';
  if (score >= 8) {
    feedback = `Uitstekend gedaan! Je hebt ${turnCount} sterke argumenten ingebracht en je standpunt "${userStandpoint}" overtuigend verdedigd. Je liet zien dat je goed kon luisteren naar tegenargumenten en daar adequaat op kon reageren.`;
  } else if (score >= 6) {
    feedback = `Goed geprobeerd! Je verdedigde het standpunt "${userStandpoint}" met ${turnCount} argumenten. Probeer volgende keer meer diepgang toe te voegen en uitgebreider in te gaan op de tegenargumenten van de coach.`;
  } else {
    feedback = `Je hebt het standpunt "${userStandpoint}" verdedigd met ${turnCount} reacties. Probeer volgende keer uitgebreidere argumenten te geven en concrete voorbeelden te gebruiken om je punt te maken.`;
  }

  return {
    userArguments: userArguments.slice(0, 5),
    coachArguments: coachArguments.slice(0, 5),
    performanceScore: score,
    feedback,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: DebateRequest = await req.json();

    if (!body.topic || !body.standpoint) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (body.generateSummary && body.messages) {
      const summary = generateSummary(body.messages, body.standpoint);
      return new Response(
        JSON.stringify({ summary }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!body.userInput) {
      return new Response(
        JSON.stringify({ error: "Missing userInput for debate response" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const response = generateDebateResponse(body);

    return new Response(
      JSON.stringify({ response }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
