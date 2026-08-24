using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardsController : ControllerBase
{
    private readonly Supabase.Client _supabase;

    public BoardsController(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    // Helper method to map Postgrest Board model to BoardResponseDto
    private static BoardResponseDto MapToDto(Board board)
    {
        return new BoardResponseDto
        {
            Id = board.Id,
            Title = board.Title,
            Description = board.Description,
            GridWidth = board.GridWidth,
            GridHeight = board.GridHeight,
            DataJson = board.DataJson,
            CreatedAt = board.CreatedAt,
            UpdatedAt = board.UpdatedAt,
            CreatedByUserId = board.CreatedByUserId
        };
    }

    // GET /api/boards
    [HttpGet]
    public async Task<IActionResult> GetAllBoards()
    {
        var response = await _supabase.From<Board>().Get();
        var dtos = response.Models.Select(MapToDto);
        
        return Ok(dtos);
    }

    // GET /api/boards/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetBoard(string id)
    {
        var response = await _supabase
            .From<Board>()
            .Where(b => b.Id == id)
            .Single();

        if (response == null) return NotFound();

        return Ok(MapToDto(response));
    }

    // POST /api/boards
    [HttpPost]
    public async Task<IActionResult> CreateBoard([FromBody] CreateBoardDto dto)
    {
        var board = new Board
        {
            Title = dto.Title,
            Description = dto.Description,
            GridWidth = dto.GridWidth,
            GridHeight = dto.GridHeight,
            DataJson = dto.DataJson
        };

        var response = await _supabase.From<Board>().Insert(board);
        var createdBoard = response.Models.FirstOrDefault();

        if (createdBoard == null) return BadRequest("Failed to create board.");

        var resultDto = MapToDto(createdBoard);
        return CreatedAtAction(nameof(GetBoard), new { id = resultDto.Id }, resultDto);
    }

    // PUT /api/boards/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBoard(string id, [FromBody] CreateBoardDto dto)
    {
        var response = await _supabase
            .From<Board>()
            .Where(b => b.Id == id)
            .Set(b => b.Title, dto.Title)
            .Set(b => b.Description, dto.Description)
            .Set(b => b.GridWidth, dto.GridWidth)
            .Set(b => b.GridHeight, dto.GridHeight)
            .Set(b => b.DataJson, dto.DataJson)
            .Set(b => b.UpdatedAt, DateTime.UtcNow)
            .Update();

        var updated = response.Models.FirstOrDefault();
        if (updated == null)
        {
            return NotFound();
        }

        return Ok(MapToDto(updated));
    }

    // DELETE /api/boards/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBoard(string id)
    {
        await _supabase
            .From<Board>()
            .Where(b => b.Id == id)
            .Delete();

        return NoContent();
    }
}