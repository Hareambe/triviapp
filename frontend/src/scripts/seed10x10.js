import http from 'http';

const mega10x10Board = {
  title: "The Ultimate Decathlon (10x10 Mega Board)",
  description: "10 Categories with 10 Questions each ($100 to $1000) — 100 Clues covering History, Science, Geography, Cinema, Gaming, Music, Literature, Tech, Sports, and Myth!",
  gridWidth: 10,
  gridHeight: 10,
  dataJson: JSON.stringify({
    categories: [
      {
        name: "World History",
        questions: [
          { value: 100, prompt: "In what year did the Titanic sink?", answer: "1912", isDailyDouble: false },
          { value: 200, prompt: "Who was the first President of the United States?", answer: "George Washington", isDailyDouble: false },
          { value: 300, prompt: "In what year did World War II end?", answer: "1945", isDailyDouble: false },
          { value: 400, prompt: "Who was the French emperor defeated at Waterloo in 1815?", answer: "Napoleon Bonaparte", isDailyDouble: false },
          { value: 500, prompt: "Which empire was ruled by Suleiman the Magnificent?", answer: "The Ottoman Empire", isDailyDouble: false },
          { value: 600, prompt: "What wall built in 1961 fell in November 1989?", answer: "The Berlin Wall", isDailyDouble: false },
          { value: 700, prompt: "Which English king was executed in 1649 during the English Civil War?", answer: "King Charles I", isDailyDouble: true },
          { value: 800, prompt: "What Russian dynasty ruled for over 300 years until 1917?", answer: "The Romanov Dynasty", isDailyDouble: false },
          { value: 900, prompt: "Which treaty ended World War I in 1919?", answer: "The Treaty of Versailles", isDailyDouble: false },
          { value: 1000, prompt: "Who was the first emperor of a unified China (builder of the Terracotta Army)?", answer: "Qin Shi Huang", isDailyDouble: false }
        ]
      },
      {
        name: "Earth & Space",
        questions: [
          { value: 100, prompt: "What planet is closest to the Sun?", answer: "Mercury", isDailyDouble: false },
          { value: 200, prompt: "What is the hardest natural mineral on Earth?", answer: "Diamond", isDailyDouble: false },
          { value: 300, prompt: "What is the chemical symbol for Gold?", answer: "Au", isDailyDouble: false },
          { value: 400, prompt: "What is the hottest planet in the Solar System?", answer: "Venus", isDailyDouble: false },
          { value: 500, prompt: "What layer of Earth's atmosphere absorbs ultraviolet radiation?", answer: "The Ozone Layer", isDailyDouble: false },
          { value: 600, prompt: "What is the speed of light in vacuum (approx. in km/s)?", answer: "300,000 km/s (299,792 km/s)", isDailyDouble: false },
          { value: 700, prompt: "What space telescope was launched on Christmas Day 2021 as Hubble's successor?", answer: "James Webb Space Telescope (JWST)", isDailyDouble: false },
          { value: 800, prompt: "What is the boundary around a black hole beyond which nothing can escape?", answer: "The Event Horizon", isDailyDouble: true },
          { value: 900, prompt: "What subatomic particle was discovered in 2012 at CERN's Large Hadron Collider?", answer: "The Higgs Boson", isDailyDouble: false },
          { value: 1000, prompt: "What is the approximate age of the universe in billions of years?", answer: "13.8 Billion Years", isDailyDouble: false }
        ]
      },
      {
        name: "World Geography",
        questions: [
          { value: 100, prompt: "What is the capital city of France?", answer: "Paris", isDailyDouble: false },
          { value: 200, prompt: "What is the longest river in South America?", answer: "The Amazon River", isDailyDouble: false },
          { value: 300, prompt: "Which country has the largest land area in the world?", answer: "Russia", isDailyDouble: false },
          { value: 400, prompt: "What is the highest mountain peak on Earth?", answer: "Mount Everest", isDailyDouble: false },
          { value: 500, prompt: "Which desert is the largest hot desert on Earth?", answer: "The Sahara Desert", isDailyDouble: false },
          { value: 600, prompt: "What strait separates Europe and Africa between Spain and Morocco?", answer: "The Strait of Gibraltar", isDailyDouble: false },
          { value: 700, prompt: "What is the capital city of Australia?", answer: "Canberra", isDailyDouble: false },
          { value: 800, prompt: "Which African country is known as the 'Rainbow Nation'?", answer: "South Africa", isDailyDouble: false },
          { value: 900, prompt: "What is the deepest lake in the world, located in Siberia?", answer: "Lake Baikal", isDailyDouble: false },
          { value: 1000, prompt: "What is the least densely populated sovereign nation in the world?", answer: "Mongolia", isDailyDouble: false }
        ]
      },
      {
        name: "Cinema & Movies",
        questions: [
          { value: 100, prompt: "Who directed the 1993 film Jurassic Park?", answer: "Steven Spielberg", isDailyDouble: false },
          { value: 200, prompt: "What fictional metal is Captain America's shield made from?", answer: "Vibranium", isDailyDouble: false },
          { value: 300, prompt: "Who played Jack Dawson in the 1997 film Titanic?", answer: "Leonardo DiCaprio", isDailyDouble: false },
          { value: 400, prompt: "What movie won the Academy Award for Best Picture in 1994 starring Tom Hanks?", answer: "Forrest Gump", isDailyDouble: false },
          { value: 500, prompt: "Who directed the dark superhero film The Dark Knight (2008)?", answer: "Christopher Nolan", isDailyDouble: false },
          { value: 600, prompt: "In The Matrix, what color pill allows Neo to see the truth?", answer: "The Red Pill", isDailyDouble: false },
          { value: 700, prompt: "What 2019 Korean film became the first foreign language film to win Best Picture at the Oscars?", answer: "Parasite", isDailyDouble: false },
          { value: 800, prompt: "Who won Best Actor for playing the Joker in 2019?", answer: "Joaquin Phoenix", isDailyDouble: true },
          { value: 900, prompt: "What 1941 Orson Welles film is famous for the mystery of 'Rosebud'?", answer: "Citizen Kane", isDailyDouble: false },
          { value: 1000, prompt: "Who is the only director to have won three Best Director Oscars without directing Best Picture winners?", answer: "Frank Capra / William Wyler", isDailyDouble: false }
        ]
      },
      {
        name: "Video Games",
        questions: [
          { value: 100, prompt: "What Italian plumber is the mascot of Nintendo?", answer: "Mario", isDailyDouble: false },
          { value: 200, prompt: "What block-building sandbox game was created by Markus 'Notch' Persson?", answer: "Minecraft", isDailyDouble: false },
          { value: 300, prompt: "What blue hedgehog is the mascot of Sega?", answer: "Sonic the Hedgehog", isDailyDouble: false },
          { value: 400, prompt: "What is the name of the protagonist in The Legend of Zelda series?", answer: "Link", isDailyDouble: false },
          { value: 500, prompt: "In Pokémon, which Electric-type mouse is mascot of the franchise?", answer: "Pikachu", isDailyDouble: false },
          { value: 600, prompt: "What city is the setting for Grand Theft Auto: Vice City?", answer: "Vice City (Miami-inspired)", isDailyDouble: false },
          { value: 700, prompt: "What is Master Chief's AI companion's name in Halo?", answer: "Cortana", isDailyDouble: false },
          { value: 800, prompt: "What 2011 Bethesda RPG is set in the northern province of Tamriel?", answer: "The Elder Scrolls V: Skyrim", isDailyDouble: false },
          { value: 900, prompt: "What 2022 FromSoftware action RPG takes place in the Lands Between?", answer: "Elden Ring", isDailyDouble: false },
          { value: 1000, prompt: "What was the very first commercially successful arcade video game released by Atari in 1972?", answer: "Pong", isDailyDouble: false }
        ]
      },
      {
        name: "Music Legends",
        questions: [
          { value: 100, prompt: "Who was known as the 'King of Pop'?", answer: "Michael Jackson", isDailyDouble: false },
          { value: 200, prompt: "What British rock band released the album Abbey Road in 1969?", answer: "The Beatles", isDailyDouble: false },
          { value: 300, prompt: "Which singer is known for the hit song 'Rolling in the Deep'?", answer: "Adele", isDailyDouble: false },
          { value: 400, prompt: "Who was the lead singer of the rock band Queen?", answer: "Freddie Mercury", isDailyDouble: false },
          { value: 500, prompt: "Which composer wrote the famous Fifth Symphony and Ode to Joy while deaf?", answer: "Ludwig van Beethoven", isDailyDouble: false },
          { value: 600, prompt: "What Swedish pop group won Eurovision in 1974 with 'Waterloo'?", answer: "ABBA", isDailyDouble: false },
          { value: 700, prompt: "Which rapper released the groundbreaking 1994 album Illmatic?", answer: "Nas", isDailyDouble: false },
          { value: 800, prompt: "What jazz trumpet legend recorded the best-selling jazz album Kind of Blue (1959)?", answer: "Miles Davis", isDailyDouble: true },
          { value: 900, prompt: "Which 18th-century Austrian musical child prodigy composed over 600 works before dying at age 35?", answer: "Wolfgang Amadeus Mozart", isDailyDouble: false },
          { value: 1000, prompt: "What artist recorded the best-selling reggae album of all time, Legend?", answer: "Bob Marley & The Wailers", isDailyDouble: false }
        ]
      },
      {
        name: "Books & Literature",
        questions: [
          { value: 100, prompt: "Who wrote the Harry Potter book series?", answer: "J.K. Rowling", isDailyDouble: false },
          { value: 200, prompt: "Which playwright wrote Romeo and Juliet and Hamlet?", answer: "William Shakespeare", isDailyDouble: false },
          { value: 300, prompt: "What fictional detective lived at 221B Baker Street?", answer: "Sherlock Holmes", isDailyDouble: false },
          { value: 400, prompt: "Who wrote the dystopian novel 1984?", answer: "George Orwell", isDailyDouble: false },
          { value: 500, prompt: "What is the name of the captain obsessed with the white whale in Moby-Dick?", answer: "Captain Ahab", isDailyDouble: false },
          { value: 600, prompt: "Who wrote The Great Gatsby published in 1925?", answer: "F. Scott Fitzgerald", isDailyDouble: false },
          { value: 700, prompt: "Which Russian author wrote War and Peace and Anna Karenina?", answer: "Leo Tolstoy", isDailyDouble: false },
          { value: 800, prompt: "What epic poem by Homer tells the story of Odysseus's journey home?", answer: "The Odyssey", isDailyDouble: false },
          { value: 900, prompt: "Who wrote the epic 14th-century Italian poem Divine Comedy?", answer: "Dante Alighieri", isDailyDouble: false },
          { value: 1000, prompt: "What Spanish novel by Miguel de Cervantes is widely considered the first modern novel?", answer: "Don Quixote", isDailyDouble: false }
        ]
      },
      {
        name: "Tech & Computing",
        questions: [
          { value: 100, prompt: "What operating system uses a green robot as its mascot?", answer: "Android", isDailyDouble: false },
          { value: 200, prompt: "Who co-founded Apple Computer alongside Steve Wozniak in 1976?", answer: "Steve Jobs", isDailyDouble: false },
          { value: 300, prompt: "What does 'WWW' stand for in website addresses?", answer: "World Wide Web", isDailyDouble: false },
          { value: 400, prompt: "What programming language was developed by Guido van Rossum in 1991?", answer: "Python", isDailyDouble: false },
          { value: 500, prompt: "What company developed the Windows operating system?", answer: "Microsoft", isDailyDouble: false },
          { value: 600, prompt: "What does 'CPU' stand for in computing?", answer: "Central Processing Unit", isDailyDouble: false },
          { value: 700, prompt: "Who is considered the father of computer science who cracked the Enigma code at Bletchley Park?", answer: "Alan Turing", isDailyDouble: true },
          { value: 800, prompt: "In what year was the first iPhone unveiled by Steve Jobs?", answer: "2007", isDailyDouble: false },
          { value: 900, prompt: "What consensus mechanism was originally used by Bitcoin to secure transactions?", answer: "Proof of Work (PoW)", isDailyDouble: false },
          { value: 1000, prompt: "Who wrote the first computer algorithm for the Mechanical Analytical Engine?", answer: "Ada Lovelace", isDailyDouble: false }
        ]
      },
      {
        name: "Sports & Athletics",
        questions: [
          { value: 100, prompt: "In soccer, how many players per team are on the field?", answer: "11", isDailyDouble: false },
          { value: 200, prompt: "How many points is a touchdown worth in American football (without extra point)?", answer: "6 points", isDailyDouble: false },
          { value: 300, prompt: "Which country hosted the 2016 Summer Olympic Games?", answer: "Brazil (Rio de Janeiro)", isDailyDouble: false },
          { value: 400, prompt: "Which basketball superstar won 6 NBA championships with the Chicago Bulls?", answer: "Michael Jordan", isDailyDouble: false },
          { value: 500, prompt: "In tennis, what Grand Slam tournament is played on grass courts?", answer: "Wimbledon", isDailyDouble: false },
          { value: 600, prompt: "Which country has won the most FIFA World Cup titles?", answer: "Brazil (5 titles)", isDailyDouble: false },
          { value: 700, prompt: "What Jamaican sprinter holds the world record for both the 100m and 200m dash?", answer: "Usain Bolt", isDailyDouble: false },
          { value: 800, prompt: "How many rings are on the official Olympic flag?", answer: "5 rings", isDailyDouble: false },
          { value: 900, prompt: "Which swimmer holds the record for the most Olympic gold medals in history (23)?", answer: "Michael Phelps", isDailyDouble: false },
          { value: 1000, prompt: "In baseball, what pitcher threw the only perfect game in World Series history (1956)?", answer: "Don Larsen", isDailyDouble: false }
        ]
      },
      {
        name: "Myth & Folklore",
        questions: [
          { value: 100, prompt: "In Greek mythology, who was the king of the gods who wielded lightning?", answer: "Zeus", isDailyDouble: false },
          { value: 200, prompt: "In Norse mythology, what is the name of Thor's magical hammer?", answer: "Mjölnir", isDailyDouble: false },
          { value: 300, prompt: "What mythical creature has the head of a human and the body of a lion in Egypt?", answer: "The Sphinx", isDailyDouble: false },
          { value: 400, prompt: "In Greek myth, who flew too close to the sun with wax wings?", answer: "Icarus", isDailyDouble: false },
          { value: 500, prompt: "In Roman mythology, who was the god of war (Greek equivalent: Ares)?", answer: "Mars", isDailyDouble: false },
          { value: 600, prompt: "What mythical bird is reborn from its own ashes in Greek mythology?", answer: "The Phoenix", isDailyDouble: false },
          { value: 700, prompt: "In Greek myth, what creature with snakes for hair turned onlookers to stone?", answer: "Medusa (The Gorgon)", isDailyDouble: false },
          { value: 800, prompt: "In Arthurian legend, what was the name of King Arthur's magical sword?", answer: "Excalibur", isDailyDouble: false },
          { value: 900, prompt: "In Norse myth, what event marks the cataclysmic destruction and rebirth of the cosmos?", answer: "Ragnarök", isDailyDouble: false },
          { value: 1000, prompt: "In Mesopotamian myth, who was the hero king of Uruk in the oldest surviving epic poem?", answer: "Gilgamesh", isDailyDouble: false }
        ]
      }
    ]
  })
};

const postBoard = (board) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(board);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5032,
        path: '/api/boards',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(body));
          } else {
            reject(new Error(`Failed to post board "${board.title}": ${res.statusCode} ${body}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

async function seed() {
  console.log("Seeding 10x10 Mega Board...");
  try {
    const result = await postBoard(mega10x10Board);
    console.log(`✓ Created: "${result.title}" (ID: ${result.id}) [10x10 Grid - 100 Clues]`);
  } catch (err) {
    console.error("Error seeding board:", err.message);
  }
}

seed();
