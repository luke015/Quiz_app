# Bulk Results Entry Feature

## Overview
The quiz app now supports bulk entry mode for entering results for multiple players at once. This feature is activated when a quiz is selected but no specific player is chosen.

## How It Works

### User Interface
1. **Navigate to Results Entry**: Go to the "Enter Results" page
2. **Select a Quiz**: Choose the quiz you want to enter results for
3. **Leave Player Empty**: Don't select a specific player - this activates bulk entry mode
4. **Enter Scores**: A list of all players will appear with input fields for their total scores
5. **Submit**: Click "Save Results" to save all non-zero scores at once

### Features
- **Bulk Entry Mode**: Enter scores for multiple players simultaneously
- **Smart Filtering**: Only players with scores greater than 0 are saved
- **Maximum Score Validation**: Scores are automatically clamped to the quiz's maximum possible points
- **Visual Feedback**: 
  - Clear indication when bulk mode is active
  - Summary showing how many players have scores entered
  - Hover effects on player rows for better UX
- **Scrollable List**: For quizzes with many players, the list is scrollable (max height: 384px)

### Technical Implementation

#### New Types
```typescript
export interface BulkResultEntry {
  playerId: string;
  score: number;
}

export interface BulkResultsSubmission {
  quizId: string;
  entries: BulkResultEntry[];
}
```

#### API Endpoint
- **POST** `/api/results/bulk`
- **Authentication**: Required
- **Body**: `{ quizId: string, entries: BulkResultEntry[] }`
- **Response**: `{ message: string, results: Result[] }`

#### Score Distribution
When bulk results are submitted, the total score for each player is automatically distributed evenly across all questions in the quiz, similar to the "Total Points Only" mode for individual players.

## Benefits
1. **Time Saving**: Enter results for an entire quiz session in one go
2. **Efficiency**: No need to select each player individually
3. **Flexibility**: Can still use individual player mode when needed
4. **User-Friendly**: Clear visual indicators and intuitive interface

## Example Use Case
After a quiz night with 10 players:
1. Select the quiz that was played
2. Leave the player dropdown empty
3. Enter each player's total score in the bulk entry list
4. Click "Save Results" once to save all 10 results

This is much faster than entering results one player at a time!




