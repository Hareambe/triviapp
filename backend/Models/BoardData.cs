namespace backend.Models;

public class BoardData
{
    public List<CategoryData> Categories { get; set; } = new();
}

public class CategoryData
{
    public string Name { get; set; } = string.Empty;
    public List<QuestionData> Questions { get; set; } = new();
}

public class QuestionData
{
    public int Value { get; set; } // e.g., 200, 400, 600, 800, 1000
    public string Prompt { get; set; } = string.Empty; // The clue/question
    public string Answer { get; set; } = string.Empty;  // The answer
    public bool IsDailyDouble { get; set; } = false;
    public string? QuestionType { get; set; } // "standard", "media", "image"
    public string? ImageDisplayMode { get; set; } // "gallery", "progressive"
    public string? MediaUrl { get; set; }
    public List<string>? MediaUrls { get; set; }
    public bool IsAudioOnly { get; set; } = false;
}