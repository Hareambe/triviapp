namespace backend.DTOs;

public class BoardResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int GridWidth { get; set; }
    public int GridHeight { get; set; }
    public string DataJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? CreatedByUserId { get; set; }
}

public class CreateBoardDto
{
    public string Title { get; set; } = "Untitled Board";
    public string Description { get; set; } = string.Empty;
    public int GridWidth { get; set; } = 6;
    public int GridHeight { get; set; } = 5;
    public string DataJson { get; set; } = "{}";
}