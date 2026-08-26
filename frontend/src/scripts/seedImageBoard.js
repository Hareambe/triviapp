import http from 'http';

const imageTriviaBoard = {
  title: "Visual Wonders & World Landmarks (Image Board)",
  description: "A picture-based Jeopardy board featuring famous world landmarks, iconic art masterpieces, celestial space photos, and microscopic close-ups!",
  gridWidth: 4,
  gridHeight: 4,
  dataJson: JSON.stringify({
    categories: [
      {
        name: "World Landmarks",
        questions: [
          {
            value: 200,
            prompt: "Identify this ancient amphitheatre located in the centre of Rome, Italy:",
            answer: "The Colosseum",
            mediaUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&auto=format&fit=crop&q=80",
            isDailyDouble: false
          },
          {
            value: 400,
            prompt: "Name this 15th-century Inca citadel situated on a mountain ridge in Peru:",
            answer: "Machu Picchu",
            mediaUrl: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&auto=format&fit=crop&q=80",
            isDailyDouble: false
          },
          {
            value: 600,
            prompt: "What is the name of this ivory-white marble mausoleum on the Yamuna river in Agra, India?",
            answer: "Taj Mahal",
            mediaUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&auto=format&fit=crop&q=80",
            isDailyDouble: true
          },
          {
            value: 800,
            prompt: "Name this prehistoric monument in Wiltshire, England, consisting of an outer ring of vertical sarsen standing stones:",
            answer: "Stonehenge",
            mediaUrl: "https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=1200&auto=format&fit=crop&q=80",
            isDailyDouble: false
          }
        ]
      },
      {
        name: "Masterpieces of Art",
        questions: [
          {
            value: 200,
            prompt: "Which Dutch post-impressionist painter created this iconic 1889 oil-on-canvas painting 'The Starry Night'?",
            answer: "Vincent van Gogh",
            mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
            isDailyDouble: false
          },
          {
            value: 400,
            prompt: "Who painted this 17th-century masterpiece known as 'Girl with a Pearl Earring'?",
            answer: "Johannes Vermeer",
            mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg",
            isDailyDouble: false
          },
          {
            value: 600,
            prompt: "What is the title of this 1893 expressionist composition by Norwegian artist Edvard Munch?",
            answer: "The Scream",
            mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg",
            isDailyDouble: false
          },
          {
            value: 800,
            prompt: "Which Japanese ukiyo-e artist created this famous woodblock print 'The Great Wave off Kanagawa'?",
            answer: "Hokusai",
            mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1280px-Tsunami_by_hokusai_19th_century.jpg",
            isDailyDouble: false
          }
        ]
      },
      {
        name: "Deep Space & Universe",
        questions: [
          {
            value: 200,
            prompt: "Identify this gas giant, the 6th planet from the Sun, known for its extensive ring system:",
            answer: "Saturn",
            mediaUrl: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=1200&auto=format&fit=crop&q=80",
            isDailyDouble: false
          },
          {
            value: 400,
            prompt: "What iconic star-forming region captured by Hubble and James Webb telescopes is nicknamed the 'Pillars of Creation'?",
            answer: "Eagle Nebula (Messier 16)",
            mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg/1024px-Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg",
            isDailyDouble: false
          },
          {
            value: 600,
            prompt: "Name our closest spiral galaxy neighbour, located approximately 2.5 million light-years from Earth:",
            answer: "Andromeda Galaxy (M31)",
            mediaUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80",
            isDailyDouble: true
          },
          {
            value: 800,
            prompt: "In 2019, the Event Horizon Telescope captured the first ever direct image of a black hole at the center of which supergiant elliptical galaxy?",
            answer: "Messier 87 (M87)",
            mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Black_hole_-_Messier_87_crop_max_res.jpg/1024px-Black_hole_-_Messier_87_crop_max_res.jpg",
            isDailyDouble: false
          }
        ]
      },
      {
        name: "Macro & Wildlife",
        questions: [
          {
            value: 200,
            prompt: "Name this brightly colored amphibian native to Central and South America, known for its toxic skin secretions:",
            answer: "Poison Dart Frog",
            mediaUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80",
            isDailyDouble: false
          },
          {
            value: 400,
            prompt: "Identify this predatory insect with raptorial front legs folded in a stance resembling prayer:",
            answer: "Praying Mantis",
            mediaUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=1200&auto=format&fit=crop&q=80",
            isDailyDouble: false
          },
          {
            value: 600,
            prompt: "Which large marine crustacean is famous for possessing claws that can punch with the speed of a .22 calibre bullet?",
            answer: "Peacock Mantis Shrimp",
            mediaUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80",
            isDailyDouble: false
          },
          {
            value: 800,
            prompt: "What is the common name for this microscopic eight-legged segmented animal known for surviving extreme outer space conditions?",
            answer: "Tardigrade (Water Bear)",
            mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Hypsibius_dujardini_SEM_2.jpg/1024px-Hypsibius_dujardini_SEM_2.jpg",
            isDailyDouble: false
          }
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
  console.log("Seeding Image Trivia Board...");
  try {
    const result = await postBoard(imageTriviaBoard);
    console.log(`✓ Created Image Board: "${result.title}" (ID: ${result.id})`);
  } catch (err) {
    console.error("Error seeding image board:", err.message);
  }
}

seed();

