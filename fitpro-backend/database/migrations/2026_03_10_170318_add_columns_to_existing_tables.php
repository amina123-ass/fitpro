<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add is_read to messages if not exists
        if (!Schema::hasColumn('messages', 'is_read')) {
            Schema::table('messages', function (Blueprint $table) {
                $table->boolean('is_read')->default(false)->after('content');
            });
        }

        // Add avatar to users if not exists
        if (!Schema::hasColumn('users', 'avatar')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('avatar')->nullable()->after('email');
            });
        }

        // Add phone to users if not exists
        if (!Schema::hasColumn('users', 'phone')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('phone')->nullable()->after('avatar');
            });
        }

        // Add extra columns to exercises if not exists
        foreach ([
            'equipment'     => ['string', 'nullable'],
            'instructions'  => ['json',   'nullable'],
            'tips'          => ['json',   'nullable'],
            'sets_default'  => ['integer','nullable'],
            'reps_default'  => ['integer','nullable'],
        ] as $col => [$type, $modifier]) {
            if (!Schema::hasColumn('exercises', $col)) {
                Schema::table('exercises', function (Blueprint $table) use ($col, $type) {
                    $table->$type($col)->nullable();
                });
            }
        }

        // Add extra columns to programs if not exists
        foreach ([
            'target_audience'          => 'string',
            'estimated_calories_week'  => 'integer',
            'is_public'                => 'boolean',
        ] as $col => $type) {
            if (!Schema::hasColumn('programs', $col)) {
                Schema::table('programs', function (Blueprint $table) use ($col, $type) {
                    if ($type === 'boolean') {
                        $table->boolean($col)->default(true);
                    } else {
                        $table->$type($col)->nullable();
                    }
                });
            }
        }

        // Add is_rest to program_days if not exists
        if (!Schema::hasColumn('program_days', 'is_rest')) {
            Schema::table('program_days', function (Blueprint $table) {
                $table->boolean('is_rest')->default(false)->after('title');
            });
        }

        // Add duration_seconds to program_exercises if not exists
        if (!Schema::hasColumn('program_exercises', 'duration_seconds')) {
            Schema::table('program_exercises', function (Blueprint $table) {
                $table->integer('duration_seconds')->nullable()->after('reps');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('existing_tables', function (Blueprint $table) {
            //
        });
    }
};
