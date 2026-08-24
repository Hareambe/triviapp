using Supabase;

// 1. Load the .env file variables into environment memory
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// 2. Read variables from environment variables (or fall back to appsettings)
var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL") 
    ?? builder.Configuration["Supabase:Url"];
    
var supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_KEY") 
    ?? builder.Configuration["Supabase:Key"];

// 3. Register Supabase Client
builder.Services.AddSingleton(sp => 
    new Supabase.Client(supabaseUrl!, supabaseKey, new SupabaseOptions
    {
        AutoRefreshToken = true,
        AutoConnectRealtime = true
    }));

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

var supabaseClient = app.Services.GetRequiredService<Supabase.Client>();
await supabaseClient.InitializeAsync();

app.UseCors("AllowFrontend");
app.MapControllers();

app.Run();