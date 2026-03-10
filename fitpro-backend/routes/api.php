<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\WorkoutController;
use App\Http\Controllers\NutritionController;
use App\Http\Controllers\WeightLogController;
use App\Http\Controllers\CoachController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Exercises (read-only)
Route::get('/exercises',               [ExerciseController::class, 'index']);
Route::get('/exercises/categories',    [ExerciseController::class, 'categories']);
Route::get('/exercises/muscle-groups', [ExerciseController::class, 'muscleGroups']);
Route::get('/exercises/stats',         [ExerciseController::class, 'stats']);
Route::get('/exercises/{exercise}',    [ExerciseController::class, 'show']);

// Programs (read-only)
Route::get('/programs',                    [ProgramController::class, 'index']);
Route::get('/programs/{program}',          [ProgramController::class, 'show']);
Route::get('/programs/{program}/reviews',  [ProgramController::class, 'reviews']);

/*
|--------------------------------------------------------------------------
| Authenticated routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    /*
    |----------------------------------------------------------------------
    | USER routes  (role: user | coach | admin)
    |----------------------------------------------------------------------
    */
    Route::middleware('role:user,coach,admin')->group(function () {

        // ── Profile ───────────────────────────────────────────────────
        Route::get('/profile',              [UserController::class, 'profile']);
        Route::put('/profile',              [UserController::class, 'updateProfile']);
        Route::put('/profile/password',     [UserController::class, 'changePassword']);
        Route::delete('/account',           [UserController::class, 'deleteAccount']);

        // ── Dashboard & utilities ─────────────────────────────────────
        Route::get('/dashboard',            [UserController::class, 'dashboard']);
        Route::get('/notifications',        [UserController::class, 'notifications']);
        Route::get('/achievements',         [UserController::class, 'achievements']);
        Route::post('/bmi',                 [UserController::class, 'bmiCalculator']);
        Route::get('/calorie-needs',        [UserController::class, 'calorieNeeds']);

        // ── Workouts ──────────────────────────────────────────────────
        Route::get('/workouts',             [WorkoutController::class, 'index']);
        Route::post('/workouts',            [WorkoutController::class, 'store']);
        Route::get('/workouts/stats',       [WorkoutController::class, 'stats']);
        Route::get('/workouts/calendar',    [WorkoutController::class, 'calendar']);
        Route::get('/workouts/export',      [WorkoutController::class, 'export']);
        Route::get('/workouts/{workout}',   [WorkoutController::class, 'show']);
        Route::put('/workouts/{workout}',   [WorkoutController::class, 'update']);
        Route::delete('/workouts/{workout}',[WorkoutController::class, 'destroy']);

        // ── Programs – follow/track ───────────────────────────────────
        Route::get('/my-programs',                       [ProgramController::class, 'myPrograms']);
        Route::post('/programs/{program}/follow',        [ProgramController::class, 'follow']);
        Route::post('/programs/{program}/unfollow',      [ProgramController::class, 'unfollow']);
        Route::post('/programs/{program}/complete',      [ProgramController::class, 'complete']);
        Route::get('/programs/{program}/progress',       [ProgramController::class, 'progress']);
        Route::post('/programs/{program}/reviews',       [ProgramController::class, 'addReview']);

        // ── Exercises – favorites ─────────────────────────────────────
        Route::post('/exercises/{exercise}/favorite',    [ExerciseController::class, 'toggleFavorite']);
        Route::get('/exercises/my-favorites',            [ExerciseController::class, 'myFavorites']);

        // ── Nutrition ─────────────────────────────────────────────────
        Route::get('/nutrition',                         [NutritionController::class, 'index']);
        Route::post('/nutrition',                        [NutritionController::class, 'store']);
        Route::put('/nutrition/{nutritionLog}',          [NutritionController::class, 'update']);
        Route::delete('/nutrition/{nutritionLog}',       [NutritionController::class, 'destroy']);
        Route::get('/nutrition/weekly-stats',            [NutritionController::class, 'weeklyStats']);
        Route::get('/nutrition/monthly',                 [NutritionController::class, 'monthlyReport']);
        Route::get('/nutrition/favorites',               [NutritionController::class, 'favoritefoods']);
        Route::post('/nutrition/water',                  [NutritionController::class, 'waterLog']);

        // ── Weight logs ───────────────────────────────────────────────
        Route::get('/weight-logs',                       [WeightLogController::class, 'index']);
        Route::post('/weight-logs',                      [WeightLogController::class, 'store']);
        Route::put('/weight-logs/{weightLog}',           [WeightLogController::class, 'update']);
        Route::delete('/weight-logs/{weightLog}',        [WeightLogController::class, 'destroy']);
        Route::get('/weight-logs/body-composition',      [WeightLogController::class, 'bodyComposition']);

        // ── Messages (receive) ────────────────────────────────────────
        Route::get('/messages',                          [CoachController::class, 'getMessages']);
        Route::patch('/messages/{message}/read',         [CoachController::class, 'markAsRead']);
    });

    /*
    |----------------------------------------------------------------------
    | COACH routes  (role: coach | admin)
    |----------------------------------------------------------------------
    */
    Route::middleware('role:coach,admin')->group(function () {

        // ── Coach dashboard & analytics ───────────────────────────────
        Route::get('/coach/dashboard',                   [CoachController::class, 'dashboard']);
        Route::get('/coach/analytics',                   [CoachController::class, 'analytics']);

        // ── Users management ──────────────────────────────────────────
        Route::get('/coach/users',                       [CoachController::class, 'myUsers']);
        Route::post('/coach/assign-user',                [CoachController::class, 'assignUser']);
        Route::delete('/coach/unassign-user/{user}',     [CoachController::class, 'unassignUser']);
        Route::get('/coach/users/{user}/progress',       [CoachController::class, 'userProgress']);
        Route::get('/coach/users/{user}/workouts',       [CoachController::class, 'userWorkouts']);
        Route::get('/coach/users/{user}/nutrition',      [CoachController::class, 'userNutrition']);

        // ── Coach notes ───────────────────────────────────────────────
        Route::post('/coach/users/{user}/notes',         [CoachController::class, 'addNote']);
        Route::delete('/coach/notes/{note}',             [CoachController::class, 'deleteNote']);

        // ── Weekly plans ──────────────────────────────────────────────
        Route::get('/coach/users/{user}/plans',          [CoachController::class, 'getWeeklyPlans']);
        Route::post('/coach/users/{user}/plans',         [CoachController::class, 'createWeeklyPlan']);

        // ── Messaging (send + conversations) ──────────────────────────
        Route::post('/messages',                         [CoachController::class, 'sendMessage']);
        Route::get('/messages/conversations',            [CoachController::class, 'conversations']);
        Route::get('/messages/conversation/{other}',     [CoachController::class, 'getConversation']);
        Route::post('/messages/{sender}/read',           [CoachController::class, 'markMessagesRead']);

        // ── Exercises CRUD ────────────────────────────────────────────
        Route::post('/exercises',                        [ExerciseController::class, 'store']);
        Route::put('/exercises/{exercise}',              [ExerciseController::class, 'update']);
        Route::delete('/exercises/{exercise}',           [ExerciseController::class, 'destroy']);
        Route::post('/exercises/bulk-delete',            [ExerciseController::class, 'bulkDelete']);
        Route::post('/exercises/{exercise}/duplicate',   [ExerciseController::class, 'duplicate']);

        // ── Programs CRUD ─────────────────────────────────────────────
        Route::post('/programs',                         [ProgramController::class, 'store']);
        Route::put('/programs/{program}',                [ProgramController::class, 'update']);
        Route::delete('/programs/{program}',             [ProgramController::class, 'destroy']);
        Route::post('/programs/{program}/duplicate',     [ProgramController::class, 'duplicate']);
        Route::put('/programs/{program}/days',           [ProgramController::class, 'updateDays']);
    });

    /*
    |----------------------------------------------------------------------
    | ADMIN routes  (role: admin only)
    |----------------------------------------------------------------------
    */
    Route::middleware('role:admin')->prefix('admin')->group(function () {

        // ── Dashboard & reports ───────────────────────────────────────
        Route::get('/dashboard',                         [AdminController::class, 'dashboard']);
        Route::get('/reports',                           [AdminController::class, 'reports']);
        Route::get('/reports/export',                    [AdminController::class, 'exportReports']);

        // ── User management ───────────────────────────────────────────
        Route::get('/users',                             [AdminController::class, 'listUsers']);
        Route::get('/users/{user}',                      [AdminController::class, 'showUser']);
        Route::put('/users/{user}',                      [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}',                   [AdminController::class, 'deleteUser']);
        Route::patch('/users/{user}/toggle-status',      [AdminController::class, 'toggleUserStatus']);
        Route::patch('/users/{user}/role',               [AdminController::class, 'changeUserRole']);

        // ── Coach management ──────────────────────────────────────────
        Route::post('/coaches',                          [AdminController::class, 'createCoach']);
        Route::get('/coaches',                           [AdminController::class, 'listCoaches']);
        Route::delete('/coaches/{coach}',                [AdminController::class, 'removeCoach']);

        // ── Content moderation ────────────────────────────────────────
        Route::get('/exercises/pending',                 [AdminController::class, 'pendingExercises']);
        Route::patch('/exercises/{exercise}/approve',    [AdminController::class, 'approveExercise']);
        Route::get('/programs/pending',                  [AdminController::class, 'pendingPrograms']);
        Route::patch('/programs/{program}/approve',      [AdminController::class, 'approveProgram']);

        Route::post('/bulk-action',              [AdminController::class, 'bulkAction']);
Route::get('/exercises',                 [AdminController::class, 'listExercises']);
Route::get('/programs',                  [AdminController::class, 'listPrograms']);
Route::get('/system-stats',              [AdminController::class, 'systemStats']);
Route::patch('/exercises/{exercise}/reject', [AdminController::class, 'rejectExercise']);
Route::patch('/programs/{program}/reject',   [AdminController::class, 'rejectProgram']);
    });
});