import http from 'http';

const boards = [
  {
    title: "Pop Culture & Entertainment",
    description: "5x5 Board covering Music Royalty, Anime & Animation, Blockbuster Movies, Internet Memes, and TV Classics",
    gridWidth: 5,
    gridHeight: 5,
    dataJson: JSON.stringify({
      categories: [
        {
          name: "Music Royalty",
          questions: [
            { value: 200, prompt: "Who is widely recognized across the world as the 'Queen of Pop'?", answer: "Madonna", isDailyDouble: false },
            { value: 400, prompt: "Which Michael Jackson album became the best-selling album of all time?", answer: "Thriller", isDailyDouble: false },
            { value: 600, prompt: "Which British rock band sang the operatic rock anthem 'Bohemian Rhapsody'?", answer: "Queen", isDailyDouble: false },
            { value: 800, prompt: "What is the real first and last name of the rapper Eminem?", answer: "Marshall Mathers", isDailyDouble: true },
            { value: 1000, prompt: "Which artist won Album of the Year at the Grammys a record four times by 2024?", answer: "Taylor Swift", isDailyDouble: false }
          ]
        },
        {
          name: "Anime & Animation",
          questions: [
            { value: 200, prompt: "What electric mouse Pokémon is the franchise's global mascot?", answer: "Pikachu", isDailyDouble: false },
            { value: 400, prompt: "Who co-founded Studio Ghibli and directed 'Spirited Away' and 'Princess Mononoke'?", answer: "Hayao Miyazaki", isDailyDouble: false },
            { value: 600, prompt: "What is the title given to the supreme ninja leader in the Hidden Leaf Village in Naruto?", answer: "Hokage", isDailyDouble: false },
            { value: 800, prompt: "In Death Note, what high school prodigy discovers the supernatural notebook?", answer: "Light Yagami", isDailyDouble: false },
            { value: 1000, prompt: "What pirate captain seeks the legendary treasure known as the 'One Piece'?", answer: "Monkey D. Luffy", isDailyDouble: false }
          ]
        },
        {
          name: "Blockbuster Movies",
          questions: [
            { value: 200, prompt: "What iconic sci-fi saga features the famous line 'May the Force be with you'?", answer: "Star Wars", isDailyDouble: false },
            { value: 400, prompt: "Which James Cameron sci-fi film set on Pandora became the highest-grossing film of all time?", answer: "Avatar", isDailyDouble: false },
            { value: 600, prompt: "Which actor played Neo in the ground-breaking 1999 sci-fi movie 'The Matrix'?", answer: "Keanu Reeves", isDailyDouble: false },
            { value: 800, prompt: "Who won the 2024 Best Actor Oscar for his role as J. Robert Oppenheimer?", answer: "Cillian Murphy", isDailyDouble: false },
            { value: 1000, prompt: "What 1937 film was Disney's very first full-length animated feature film?", answer: "Snow White and the Seven Dwarfs", isDailyDouble: true }
          ]
        },
        {
          name: "Internet & Memes",
          questions: [
            { value: 200, prompt: "What Japanese dog breed is the face of the famous 'Doge' meme?", answer: "Shiba Inu", isDailyDouble: false },
            { value: 400, prompt: "What was the title of the very first video ever uploaded to YouTube in 2005?", answer: "'Me at the zoo'", isDailyDouble: false },
            { value: 600, prompt: "Which 1987 pop song by Rick Astley is used to 'Rickroll' unsuspecting internet users?", answer: "'Never Gonna Give You Up'", isDailyDouble: false },
            { value: 800, prompt: "What British computer scientist is credited with inventing the World Wide Web in 1989?", answer: "Tim Berners-Lee", isDailyDouble: false },
            { value: 1000, prompt: "What viral 2011 YouTube song by Rebecca Black focused on the end of the school week?", answer: "'Friday'", isDailyDouble: false }
          ]
        },
        {
          name: "TV Classics",
          questions: [
            { value: 200, prompt: "What fictional New York coffee house was the main hangout for the cast of 'Friends'?", answer: "Central Perk", isDailyDouble: false },
            { value: 400, prompt: "What Scranton paper supply company serves as the workplace in 'The Office'?", answer: "Dunder Mifflin", isDailyDouble: false },
            { value: 600, prompt: "In 'Stranger Things', what is the name of the dark parallel dimension?", answer: "The Upside Down", isDailyDouble: false },
            { value: 800, prompt: "What hit HBO series based on George R.R. Martin's books featured the Iron Throne?", answer: "Game of Thrones", isDailyDouble: false },
            { value: 1000, prompt: "What is the longest-running American animated television sitcom in history?", answer: "The Simpsons", isDailyDouble: false }
          ]
        }
      ]
    })
  },
  {
    title: "Deep Science & Cosmos",
    description: "5x5 Board exploring Outer Space, Computing & Tech, Human Biology, Chemistry, and Inventions",
    gridWidth: 5,
    gridHeight: 5,
    dataJson: JSON.stringify({
      categories: [
        {
          name: "Outer Space",
          questions: [
            { value: 200, prompt: "Which planet in our solar system is nicknamed the 'Red Planet'?", answer: "Mars", isDailyDouble: false },
            { value: 400, prompt: "What is the name of the spiral galaxy that contains our Solar System?", answer: "The Milky Way", isDailyDouble: false },
            { value: 600, prompt: "Which NASA mission famously landed the first humans on the Moon in July 1969?", answer: "Apollo 11", isDailyDouble: false },
            { value: 800, prompt: "What is the theoretical boundary around a black hole beyond which nothing can escape?", answer: "Event Horizon", isDailyDouble: true },
            { value: 1000, prompt: "What is the most common element found in the known universe?", answer: "Hydrogen (~75% of baryonic mass)", isDailyDouble: false }
          ]
        },
        {
          name: "Computing & Tech",
          questions: [
            { value: 200, prompt: "What mobile operating system developed by Google features a green robot mascot?", answer: "Android", isDailyDouble: false },
            { value: 400, prompt: "Who is widely considered the world's first computer programmer for her work on the Analytical Engine?", answer: "Ada Lovelace", isDailyDouble: false },
            { value: 600, prompt: "What do the letters 'CPU' stand for in computer hardware?", answer: "Central Processing Unit", isDailyDouble: false },
            { value: 800, prompt: "What networking protocol suite serves as the fundamental communication language of the internet?", answer: "TCP/IP (Transmission Control Protocol / Internet Protocol)", isDailyDouble: false },
            { value: 1000, prompt: "What famous British mathematician broke the Enigma code at Bletchley Park?", answer: "Alan Turing", isDailyDouble: false }
          ]
        },
        {
          name: "Human Biology",
          questions: [
            { value: 200, prompt: "What is the largest internal organ in the human body?", answer: "The Liver (Largest organ overall is Skin)", isDailyDouble: false },
            { value: 400, prompt: "Which blood type is considered the 'universal donor' for red blood cells?", answer: "O Negative (O-)", isDailyDouble: false },
            { value: 600, prompt: "How many bones are there in a typical adult human body?", answer: "206 bones", isDailyDouble: false },
            { value: 800, prompt: "Which hormone produced in the pancreas regulates glucose levels in the bloodstream?", answer: "Insulin", isDailyDouble: false },
            { value: 1000, prompt: "What cellular organelle is known as the powerhouse of the cell?", answer: "Mitochondrion (Mitochondria)", isDailyDouble: false }
          ]
        },
        {
          name: "Chemistry & Physics",
          questions: [
            { value: 200, prompt: "What is the chemical formula for ordinary table salt?", answer: "NaCl (Sodium Chloride)", isDailyDouble: false },
            { value: 400, prompt: "Which Russian chemist created the first widely recognized Periodic Table of Elements?", answer: "Dmitri Mendeleev", isDailyDouble: false },
            { value: 600, prompt: "What subatomic particle carries a negative electric charge?", answer: "Electron", isDailyDouble: false },
            { value: 800, prompt: "What famous thought experiment involves a cat that is simultaneously alive and dead?", answer: "Schrödinger's Cat", isDailyDouble: true },
            { value: 1000, prompt: "What is the most abundant noble gas in Earth's atmosphere?", answer: "Argon (~0.93%)", isDailyDouble: false }
          ]
        },
        {
          name: "World Inventions",
          questions: [
            { value: 200, prompt: "Who was awarded the first US patent for the electric telephone in 1876?", answer: "Alexander Graham Bell", isDailyDouble: false },
            { value: 400, prompt: "Which brothers achieved the first controlled, powered airplane flight in 1903?", answer: "Orville and Wilbur Wright", isDailyDouble: false },
            { value: 600, prompt: "Who invented the movable type printing press in Europe around 1440?", answer: "Johannes Gutenberg", isDailyDouble: false },
            { value: 800, prompt: "What Scottish physician discovered the first widely used antibiotic, Penicillin, in 1928?", answer: "Alexander Fleming", isDailyDouble: false },
            { value: 1000, prompt: "Which Swedish chemist invented dynamite and subsequently established the Nobel Prizes?", answer: "Alfred Nobel", isDailyDouble: false }
          ]
        }
      ]
    })
  },
  {
    title: "Wonders, Geography & History",
    description: "5x5 Board with Ancient Civilizations, Capital Cities, Landmark Monuments, Explorers, and Turning Points",
    gridWidth: 5,
    gridHeight: 5,
    dataJson: JSON.stringify({
      categories: [
        {
          name: "Ancient Empires",
          questions: [
            { value: 200, prompt: "Which ancient civilization built the monumental pyramids at Giza along the Nile?", answer: "Ancient Egypt", isDailyDouble: false },
            { value: 400, prompt: "What militaristic Greek city-state famously fought Athens in the Peloponnesian War?", answer: "Sparta", isDailyDouble: false },
            { value: 600, prompt: "Which ancient king of Babylon created one of the earliest surviving legal codes?", answer: "Hammurabi (Code of Hammurabi)", isDailyDouble: false },
            { value: 800, prompt: "Who became dictator of Rome before being assassinated on the Ides of March in 44 BC?", answer: "Julius Caesar", isDailyDouble: false },
            { value: 1000, prompt: "Which Chinese dynasty unified China in 221 BC and built the Terracotta Army?", answer: "Qin Dynasty", isDailyDouble: true }
          ]
        },
        {
          name: "Capital Cities",
          questions: [
            { value: 200, prompt: "What is the capital city of Japan?", answer: "Tokyo", isDailyDouble: false },
            { value: 400, prompt: "What is the planned capital city of Australia (often confused with Sydney or Melbourne)?", answer: "Canberra", isDailyDouble: false },
            { value: 600, prompt: "What is the national capital of Canada?", answer: "Ottawa", isDailyDouble: false },
            { value: 800, prompt: "What futuristic planned city replaced Rio de Janeiro as Brazil's capital in 1960?", answer: "Brasília", isDailyDouble: false },
            { value: 1000, prompt: "What is the world's northernmost capital of a sovereign state?", answer: "Reykjavik (Iceland)", isDailyDouble: false }
          ]
        },
        {
          name: "Landmarks & Monuments",
          questions: [
            { value: 200, prompt: "In which European city is the ancient amphitheater known as the Colosseum located?", answer: "Rome (Italy)", isDailyDouble: false },
            { value: 400, prompt: "In which Indian city is the white marble mausoleum Taj Mahal located?", answer: "Agra (India)", isDailyDouble: false },
            { value: 600, prompt: "Which country gifted the Statue of Liberty to the United States in 1886?", answer: "France", isDailyDouble: false },
            { value: 800, prompt: "What famous archaeological city in Jordan was carved directly into pink sandstone cliffs?", answer: "Petra", isDailyDouble: false },
            { value: 1000, prompt: "Which of the Seven Wonders of the Ancient World is the only one still largely intact today?", answer: "The Great Pyramid of Giza", isDailyDouble: true }
          ]
        },
        {
          name: "Great Explorers",
          questions: [
            { value: 200, prompt: "Which Italian explorer made four voyages across the Atlantic beginning in 1492?", answer: "Christopher Columbus", isDailyDouble: false },
            { value: 400, prompt: "Whose Portuguese expedition achieved the first recorded circumnavigation of the globe?", answer: "Ferdinand Magellan", isDailyDouble: false },
            { value: 600, prompt: "Which Venetian merchant documented his extensive travels along the Silk Road to China?", answer: "Marco Polo", isDailyDouble: false },
            { value: 800, prompt: "Which Norwegian explorer led the first expedition to reach the South Pole in 1911?", answer: "Roald Amundsen", isDailyDouble: false },
            { value: 1000, prompt: "Who was the first European explorer to reach India by sea around the Cape of Good Hope?", answer: "Vasco da Gama", isDailyDouble: false }
          ]
        },
        {
          name: "Turning Points",
          questions: [
            { value: 200, prompt: "In what year did the Berlin Wall fall, symbolizing the impending collapse of the Iron Curtain?", answer: "1989", isDailyDouble: false },
            { value: 400, prompt: "What medieval fortress and prison was stormed in Paris on July 14, 1789?", answer: "The Bastille", isDailyDouble: false },
            { value: 600, prompt: "What foundational charter of rights was signed by England's King John in 1215?", answer: "Magna Carta", isDailyDouble: false },
            { value: 800, prompt: "What 1066 battle resulted in the Norman conquest of England by William the Conqueror?", answer: "Battle of Hastings", isDailyDouble: false },
            { value: 1000, prompt: "The cultural movement known as the Renaissance originated in which Italian city?", answer: "Florence", isDailyDouble: false }
          ]
        }
      ]
    })
  },
  {
    title: "Sports, Gaming & Champions",
    description: "5x5 Board on Olympic History, World Soccer, Basketball, Classic Board Games, and Gaming Lore",
    gridWidth: 5,
    gridHeight: 5,
    dataJson: JSON.stringify({
      categories: [
        {
          name: "Olympic Games",
          questions: [
            { value: 200, prompt: "How many interlocking rings make up the official Olympic symbol?", answer: "5 rings (representing 5 continents)", isDailyDouble: false },
            { value: 400, prompt: "In which ancient country did the original Olympic Games originate?", answer: "Greece (Olympia)", isDailyDouble: false },
            { value: 600, prompt: "Which Jamaican sprinter won 8 Olympic gold medals and holds the 100m world record?", answer: "Usain Bolt", isDailyDouble: false },
            { value: 800, prompt: "Which American swimmer is the most decorated Olympian in history with 28 medals?", answer: "Michael Phelps", isDailyDouble: true },
            { value: 1000, prompt: "In what year and city were the first modern Olympic Games held?", answer: "1896 in Athens, Greece", isDailyDouble: false }
          ]
        },
        {
          name: "World Football",
          questions: [
            { value: 200, prompt: "Which country has won the most FIFA Men's World Cup titles (5 titles)?", answer: "Brazil", isDailyDouble: false },
            { value: 400, prompt: "Which Argentinian superstar captained his country to World Cup victory in Qatar 2022?", answer: "Lionel Messi", isDailyDouble: false },
            { value: 600, prompt: "Which Portuguese forward holds the all-time record for most international goals scored?", answer: "Cristiano Ronaldo", isDailyDouble: false },
            { value: 800, prompt: "What South American nation hosted and won the very first FIFA World Cup in 1930?", answer: "Uruguay", isDailyDouble: false },
            { value: 1000, prompt: "What is the common term used when a single player scores three goals in a match?", answer: "A Hat-trick", isDailyDouble: false }
          ]
        },
        {
          name: "NBA & Hoops",
          questions: [
            { value: 200, prompt: "Which basketball legend wore #23 for the Chicago Bulls and won six NBA Championships?", answer: "Michael Jordan", isDailyDouble: false },
            { value: 400, prompt: "Who surpassed Kareem Abdul-Jabbar in 2023 to become the NBA's all-time scoring leader?", answer: "LeBron James", isDailyDouble: false },
            { value: 600, prompt: "Which Canadian physical education instructor invented the game of basketball in 1891?", answer: "Dr. James Naismith", isDailyDouble: false },
            { value: 800, prompt: "Which player famously scored 100 points in a single NBA game in 1962?", answer: "Wilt Chamberlain", isDailyDouble: false },
            { value: 1000, prompt: "Which NBA franchise won their record-breaking 18th championship title in 2024?", answer: "Boston Celtics", isDailyDouble: true }
          ]
        },
        {
          name: "Board Game Lore",
          questions: [
            { value: 200, prompt: "What property trading board game features spaces like Boardwalk and Park Place?", answer: "Monopoly", isDailyDouble: false },
            { value: 400, prompt: "In chess, which piece can only move diagonally any number of unoccupied squares?", answer: "The Bishop", isDailyDouble: false },
            { value: 600, prompt: "Which classic murder mystery game features characters like Colonel Mustard and Professor Plum?", answer: "Clue (Cluedo)", isDailyDouble: false },
            { value: 800, prompt: "What word-building crossword board game uses exactly 100 wooden letter tiles?", answer: "Scrabble", isDailyDouble: false },
            { value: 1000, prompt: "What Parker Brothers strategy game challenges players to achieve global military conquest?", answer: "Risk", isDailyDouble: false }
          ]
        },
        {
          name: "Video Game Lore",
          questions: [
            { value: 200, prompt: "What armored super-soldier protagonist leads the Xbox flagship series 'Halo'?", answer: "Master Chief (John-117)", isDailyDouble: false },
            { value: 400, prompt: "In 'The Legend of Zelda', what is the green-clad heroic protagonist's name?", answer: "Link", isDailyDouble: false },
            { value: 600, prompt: "Which monster-hunting protagonist is known as the 'White Wolf' in The Witcher series?", answer: "Geralt of Rivia", isDailyDouble: false },
            { value: 800, prompt: "What AI antagonist taunts the player throughout the Aperture Science facility in 'Portal'?", answer: "GLaDOS", isDailyDouble: false },
            { value: 1000, prompt: "What 2011 open-world sandbox game made by Mojang became the highest-selling game in history?", answer: "Minecraft", isDailyDouble: false }
          ]
        }
      ]
    })
  }
];

async function seed() {
  console.log("Seeding trivia boards to backend...");
  for (const b of boards) {
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
  console.log("Seeding complete!");
}

seed();

