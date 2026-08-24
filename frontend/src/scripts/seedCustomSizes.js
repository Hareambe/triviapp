import http from 'http';

const customSizedBoards = [
  {
    title: "Cinema Legends (4x6 Grid)",
    description: "4 Categories with 6 Questions each ($100 to $600): Sci-Fi, Crime & Thrillers, Oscar Winners, and Animated Classics",
    gridWidth: 4,
    gridHeight: 6,
    dataJson: JSON.stringify({
      categories: [
        {
          name: "Sci-Fi Greats",
          questions: [
            { value: 100, prompt: "What 1982 Spielberg film features an alien who wants to 'phone home'?", answer: "E.T. the Extra-Terrestrial", isDailyDouble: false },
            { value: 200, prompt: "Who directed the 1993 dinosaur blockbuster Jurassic Park?", answer: "Steven Spielberg", isDailyDouble: false },
            { value: 300, prompt: "What is the name of the supercomputer antagonist in 2001: A Space Odyssey?", answer: "HAL 9000", isDailyDouble: false },
            { value: 400, prompt: "In Blade Runner, what name is given to bioengineered synthetic humans?", answer: "Replicants", isDailyDouble: true },
            { value: 500, prompt: "Which planet is Cooper trying to reach through a wormhole in Interstellar?", answer: "Edmunds' / Mann's / Miller's Planet (Gargantua system)", isDailyDouble: false },
            { value: 600, prompt: "What 1927 silent film by Fritz Lang depicted a futuristic dystopian city?", answer: "Metropolis", isDailyDouble: false }
          ]
        },
        {
          name: "Crime & Thrillers",
          questions: [
            { value: 100, prompt: "Who directed the 1994 mob classic Pulp Fiction?", answer: "Quentin Tarantino", isDailyDouble: false },
            { value: 200, prompt: "What is the name of the serial killer cannibal psychiatrist played by Anthony Hopkins?", answer: "Dr. Hannibal Lecter", isDailyDouble: false },
            { value: 300, prompt: "Which actor played Michael Corleone in The Godfather series?", answer: "Al Pacino", isDailyDouble: false },
            { value: 400, prompt: "In Fight Club, what is the first rule of Fight Club?", answer: "You do not talk about Fight Club", isDailyDouble: false },
            { value: 500, prompt: "Who directed the 1995 thriller Se7en starring Brad Pitt and Morgan Freeman?", answer: "David Fincher", isDailyDouble: false },
            { value: 600, prompt: "In The Usual Suspects, what is the infamous criminal mastermind's pseudonym?", answer: "Keyser Söze", isDailyDouble: true }
          ]
        },
        {
          name: "Oscar Winners",
          questions: [
            { value: 100, prompt: "Which 1997 movie won 11 Oscars and tied the all-time record with Ben-Hur?", answer: "Titanic", isDailyDouble: false },
            { value: 200, prompt: "Who won Best Director for The Lord of the Rings: The Return of the King?", answer: "Peter Jackson", isDailyDouble: false },
            { value: 300, prompt: "Which South Korean film became the first non-English language Best Picture winner in 2020?", answer: "Parasite", isDailyDouble: false },
            { value: 400, prompt: "Which actress won three Best Actress Academy Awards including for Fargo and Nomadland?", answer: "Frances McDormand", isDailyDouble: false },
            { value: 500, prompt: "What 1976 boxing movie written by Sylvester Stallone won Best Picture?", answer: "Rocky", isDailyDouble: false },
            { value: 600, prompt: "Who is the only person to win three Best Actor Oscars (My Left Foot, There Will Be Blood, Lincoln)?", answer: "Daniel Day-Lewis", isDailyDouble: false }
          ]
        },
        {
          name: "Animated Classics",
          questions: [
            { value: 100, prompt: "What toy cowboy is the protagonist of Pixar's Toy Story?", answer: "Woody", isDailyDouble: false },
            { value: 200, prompt: "What young lion prince flees the Pride Lands in The Lion King?", answer: "Simba", isDailyDouble: false },
            { value: 300, prompt: "What green ogre lives in a swamp and rescues Princess Fiona?", answer: "Shrek", isDailyDouble: false },
            { value: 400, prompt: "In Finding Nemo, what species of fish is Nemo and his father Marlin?", answer: "Clownfish", isDailyDouble: false },
            { value: 500, prompt: "What Studio Ghibli film features a young girl named Chihiro in a spirit bathhouse?", answer: "Spirited Away", isDailyDouble: false },
            { value: 600, prompt: "Which Disney film was the first animated movie ever nominated for Best Picture (1991)?", answer: "Beauty and the Beast", isDailyDouble: true }
          ]
        }
      ]
    })
  },
  {
    title: "Global Quickfire (7x3 Grid)",
    description: "7 Categories with 3 Questions each ($200, $400, $600): History, Tech, Music, Sports, Food, Gaming, and Geography",
    gridWidth: 7,
    gridHeight: 3,
    dataJson: JSON.stringify({
      categories: [
        {
          name: "History",
          questions: [
            { value: 200, prompt: "Who was the legendary Queen of Ancient Egypt who allied with Julius Caesar?", answer: "Cleopatra", isDailyDouble: false },
            { value: 400, prompt: "What year did the Apollo 11 Moon landing take place?", answer: "1969", isDailyDouble: false },
            { value: 600, prompt: "Which French military leader was defeated at the Battle of Waterloo in 1815?", answer: "Napoleon Bonaparte", isDailyDouble: false }
          ]
        },
        {
          name: "Technology",
          questions: [
            { value: 200, prompt: "What does 'HTML' stand for in web development?", answer: "HyperText Markup Language", isDailyDouble: false },
            { value: 400, prompt: "Which electric car company is founded by Elon Musk?", answer: "Tesla", isDailyDouble: false },
            { value: 600, prompt: "What is the primary cryptocurrency created by Satoshi Nakamoto?", answer: "Bitcoin", isDailyDouble: true }
          ]
        },
        {
          name: "Music",
          questions: [
            { value: 200, prompt: "Which English band were known as the 'Fab Four' from Liverpool?", answer: "The Beatles", isDailyDouble: false },
            { value: 400, prompt: "Who released the hit album 'Future Nostalgia' in 2020?", answer: "Dua Lipa", isDailyDouble: false },
            { value: 600, prompt: "What classical composer wrote the famous 'Moonlight Sonata' while losing his hearing?", answer: "Ludwig van Beethoven", isDailyDouble: false }
          ]
        },
        {
          name: "Sports",
          questions: [
            { value: 200, prompt: "How many players are on a standard soccer team on the field?", answer: "11 players", isDailyDouble: false },
            { value: 400, prompt: "Which Grand Slam tennis tournament is played on grass courts?", answer: "Wimbledon", isDailyDouble: false },
            { value: 600, prompt: "Which NFL quarterback has won the most Super Bowl rings (7 rings)?", answer: "Tom Brady", isDailyDouble: false }
          ]
        },
        {
          name: "Culinary",
          questions: [
            { value: 200, prompt: "What is the main ingredient in guacamole?", answer: "Avocado", isDailyDouble: false },
            { value: 400, prompt: "From which country does sushi originate?", answer: "Japan", isDailyDouble: false },
            { value: 600, prompt: "What Italian dessert translates literally to 'pick me up'?", answer: "Tiramisu", isDailyDouble: false }
          ]
        },
        {
          name: "Gaming",
          questions: [
            { value: 200, prompt: "What Nintendo franchise features Pikachu and Charizard?", answer: "Pokémon", isDailyDouble: false },
            { value: 400, prompt: "What battle royale game features the Battle Bus and Victory Royale?", answer: "Fortnite", isDailyDouble: false },
            { value: 600, prompt: "In Minecraft, what substance must you mix with lava to create Obsidian?", answer: "Water", isDailyDouble: true }
          ]
        },
        {
          name: "Geography",
          questions: [
            { value: 200, prompt: "What is the tallest mountain in the world above sea level?", answer: "Mount Everest", isDailyDouble: false },
            { value: 400, prompt: "Which continent is the Sahara Desert located on?", answer: "Africa", isDailyDouble: false },
            { value: 600, prompt: "What is the capital city of Spain?", answer: "Madrid", isDailyDouble: false }
          ]
        }
      ]
    })
  },
  {
    title: "Science & Space Blitz (6x4 Grid)",
    description: "6 Categories with 4 Questions each ($200 to $800): Astronomy, Physics, Biology, Chemistry, Oceans, and Robotics",
    gridWidth: 6,
    gridHeight: 4,
    dataJson: JSON.stringify({
      categories: [
        {
          name: "Astronomy",
          questions: [
            { value: 200, prompt: "What planet is closest to the Sun?", answer: "Mercury", isDailyDouble: false },
            { value: 400, prompt: "What space telescope was launched on Christmas Day 2021 as Hubble's successor?", answer: "James Webb Space Telescope (JWST)", isDailyDouble: false },
            { value: 600, prompt: "What is the brightest star in the night sky?", answer: "Sirius (the Dog Star)", isDailyDouble: false },
            { value: 800, prompt: "What type of galaxy is the Andromeda Galaxy?", answer: "Spiral Galaxy", isDailyDouble: true }
          ]
        },
        {
          name: "Physics",
          questions: [
            { value: 200, prompt: "What particle with zero rest mass carries electromagnetic radiation / light?", answer: "Photon", isDailyDouble: false },
            { value: 400, prompt: "What is Isaac Newton's third law of motion?", answer: "For every action, there is an equal and opposite reaction", isDailyDouble: false },
            { value: 600, prompt: "What famous equation relates energy to mass and the speed of light squared?", answer: "E = mc²", isDailyDouble: false },
            { value: 800, prompt: "What is absolute zero in degrees Celsius?", answer: "-273.15 °C (0 Kelvin)", isDailyDouble: false }
          ]
        },
        {
          name: "Biology",
          questions: [
            { value: 200, prompt: "What green pigment in plants is essential for photosynthesis?", answer: "Chlorophyll", isDailyDouble: false },
            { value: 400, prompt: "What double-helix molecule stores genetic information in living organisms?", answer: "DNA (Deoxyribonucleic Acid)", isDailyDouble: false },
            { value: 600, prompt: "What is the largest living species of reptile on Earth?", answer: "Saltwater Crocodile", isDailyDouble: false },
            { value: 800, prompt: "Which chamber of the human heart pumps oxygenated blood to the body?", answer: "Left Ventricle", isDailyDouble: false }
          ]
        },
        {
          name: "Chemistry",
          questions: [
            { value: 200, prompt: "What is the chemical symbol for Iron?", answer: "Fe", isDailyDouble: false },
            { value: 400, prompt: "What is the pH level of pure distilled water at room temperature?", answer: "7 (Neutral)", isDailyDouble: false },
            { value: 600, prompt: "What is the lightest chemical element in the periodic table?", answer: "Hydrogen", isDailyDouble: false },
            { value: 800, prompt: "What allotrope of carbon is composed of a single layer of carbon atoms in a hexagonal lattice?", answer: "Graphene", isDailyDouble: false }
          ]
        },
        {
          name: "Oceans",
          questions: [
            { value: 200, prompt: "What is the largest living mammal and animal on Earth?", answer: "Blue Whale", isDailyDouble: false },
            { value: 400, prompt: "What is the deepest known oceanic trench in the world?", answer: "Mariana Trench (Challenger Deep)", isDailyDouble: false },
            { value: 600, prompt: "What enormous living structure off the coast of Queensland, Australia is visible from space?", answer: "Great Barrier Reef", isDailyDouble: false },
            { value: 800, prompt: "What marine animal has three hearts and blue copper-based blood?", answer: "Octopus", isDailyDouble: true }
          ]
        },
        {
          name: "Robotics & AI",
          questions: [
            { value: 200, prompt: "What author formulated the Three Laws of Robotics in his 1942 short story?", answer: "Isaac Asimov", isDailyDouble: false },
            { value: 400, prompt: "What AI company developed the GPT series and DALL-E?", answer: "OpenAI", isDailyDouble: false },
            { value: 600, prompt: "What humanoid robot made by Boston Dynamics is known for parkour and backflips?", answer: "Atlas", isDailyDouble: false },
            { value: 800, prompt: "In what year did IBM's Deep Blue defeat world chess champion Garry Kasparov?", answer: "1997", isDailyDouble: false }
          ]
        }
      ]
    })
  }
];

async function seedCustomSizes() {
  console.log("Seeding custom-sized trivia boards to backend...");
  for (const b of customSizedBoards) {
    const data = JSON.stringify(b);
    const options = {
      hostname: 'localhost',
      port: 5032,
      path: '/api/boards',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          console.log(`Board "${b.title}" response status: ${res.statusCode}`);
          resolve(body);
        });
      });
      req.on('error', (err) => {
        console.error(`Error uploading "${b.title}":`, err.message);
        reject(err);
      });
      req.write(data);
      req.end();
    });
  }
  console.log("Custom sized boards seeded successfully!");
}

seedCustomSizes();

