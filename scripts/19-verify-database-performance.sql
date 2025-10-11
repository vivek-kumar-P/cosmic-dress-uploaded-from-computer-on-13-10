-- Verify Database Performance and Index Coverage
-- This script checks all foreign key relationships and index coverage

-- Function to check foreign key index coverage
DO $$
DECLARE
    rec RECORD;
    missing_indexes TEXT[] := '{}';
    covered_indexes TEXT[] := '{}';
BEGIN
    RAISE NOTICE 'Checking foreign key index coverage...';
    
    -- Check all foreign key constraints and their index coverage
    FOR rec IN
        SELECT 
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name, kcu.column_name
    LOOP
        -- Check if there's an index on the foreign key column
        IF EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = rec.table_name 
            AND indexdef LIKE '%' || rec.column_name || '%'
        ) THEN
            covered_indexes := array_append(covered_indexes, rec.table_name || '.' || rec.column_name);
        ELSE
            missing_indexes := array_append(missing_indexes, rec.table_name || '.' || rec.column_name);
        END IF;
    END LOOP;
    
    -- Report results
    RAISE NOTICE 'Foreign Key Index Coverage Report:';
    RAISE NOTICE '=====================================';
    
    IF array_length(covered_indexes, 1) > 0 THEN
        RAISE NOTICE 'Covered foreign keys (% total):', array_length(covered_indexes, 1);
        FOR i IN 1..array_length(covered_indexes, 1) LOOP
            RAISE NOTICE '  ✓ %', covered_indexes[i];
        END LOOP;
    END IF;
    
    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE NOTICE 'Missing indexes for foreign keys (% total):', array_length(missing_indexes, 1);
        FOR i IN 1..array_length(missing_indexes, 1) LOOP
            RAISE NOTICE '  ✗ %', missing_indexes[i];
        END LOOP;
    ELSE
        RAISE NOTICE '✓ All foreign keys have covering indexes!';
    END IF;
END $$;

-- Check table sizes and performance
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE 'Table Size and Performance Report:';
    RAISE NOTICE '==================================';
    
    FOR rec IN
        SELECT 
            schemaname,
            tablename,
            attname as column_name,
            n_distinct,
            correlation
        FROM pg_stats 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'avatars', 'saved_outfits', 'outfit_items', 'orders', 'order_items')
        ORDER BY tablename, attname
    LOOP
        RAISE NOTICE 'Table: %, Column: %, Distinct Values: %, Correlation: %', 
            rec.tablename, rec.column_name, rec.n_distinct, rec.correlation;
    END LOOP;
END $$;

-- Verify RLS policies are optimized
DO $$
DECLARE
    rec RECORD;
    policy_count INTEGER;
BEGIN
    RAISE NOTICE 'RLS Policy Optimization Report:';
    RAISE NOTICE '===============================';
    
    FOR rec IN
        SELECT tablename, COUNT(*) as policy_count
        FROM pg_policies 
        WHERE schemaname = 'public'
        GROUP BY tablename
        ORDER BY tablename
    LOOP
        RAISE NOTICE 'Table: % has % RLS policies', rec.tablename, rec.policy_count;
        
        -- Check for multiple permissive policies (performance concern)
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = rec.tablename 
        AND permissive = 'PERMISSIVE';
        
        IF policy_count > 3 THEN
            RAISE NOTICE '  ⚠ Warning: % has % permissive policies (consider consolidating)', rec.tablename, policy_count;
        ELSE
            RAISE NOTICE '  ✓ Policy count is optimized';
        END IF;
    END LOOP;
END $$;

-- Final performance summary
DO $$
BEGIN
    RAISE NOTICE 'Database Performance Verification Complete!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Review any missing foreign key indexes above';
    RAISE NOTICE '2. Check Supabase dashboard for performance warnings';
    RAISE NOTICE '3. Monitor query performance in production';
    RAISE NOTICE '4. Consider adding composite indexes for common query patterns';
END $$;
