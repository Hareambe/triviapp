using System.Text.Json;
using Postgrest.Attributes;
using Postgrest.Models;

namespace backend.Models;

[Table("boards")]
public class Board : BaseModel
{
    [PrimaryKey("id", false)]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("title")]
    public string Title { get; set; } = "Untitled Board";

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("grid_width")]
    public int GridWidth { get; set; } = 6;

    [Column("grid_height")]
    public int GridHeight { get; set; } = 5;

    // jsonb column stored directly in PostgreSQL
    [Column("data_json")]
    public string DataJson { get; set; } = "{}";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by_user_id")]
    public string? CreatedByUserId { get; set; }

    // Helper: Parse string JSON into strongly typed C# objects
    public BoardData? GetParsedData()
    {
        if (string.IsNullOrWhiteSpace(DataJson)) return new BoardData();
        return JsonSerializer.Deserialize<BoardData>(DataJson);
    }

    // Helper: Convert typed C# objects into JSON string for Supabase
    public void SetData(BoardData data)
    {
        DataJson = JsonSerializer.Serialize(data);
    }
}