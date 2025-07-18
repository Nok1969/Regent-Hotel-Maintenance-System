-- Sample notifications for testing
INSERT INTO notifications (user_id, title, description, type, is_read, related_id, created_at) VALUES
('admin-123', 'New repair request submitted', 'Room 101 - Electrical issue reported', 'new_request', false, 1, NOW() - INTERVAL '5 minutes'),
('admin-123', 'Repair completed', 'Room 312 air conditioning repair has been completed', 'completed', false, 2, NOW() - INTERVAL '1 hour'),
('admin-123', 'Status updated', 'Room 205 plumbing repair is now in progress', 'status_update', true, 3, NOW() - INTERVAL '3 hours'),
('manager-123', 'Job assigned', 'You have been assigned to handle Room 150 electrical repair', 'assigned', false, 4, NOW() - INTERVAL '2 hours'),
('manager-123', 'New repair request submitted', 'Room 250 - Air conditioning not working', 'new_request', false, 5, NOW() - INTERVAL '1 hour'),
('staff-123', 'Repair completed', 'Your repair request for Room 180 has been completed', 'completed', false, 6, NOW() - INTERVAL '30 minutes'),
('staff-123', 'Status updated', 'Your repair request for Room 190 is now in progress', 'status_update', true, 7, NOW() - INTERVAL '4 hours'),
('tech-123', 'Job assigned', 'You have been assigned to handle Room 205 plumbing repair', 'assigned', false, 8, NOW() - INTERVAL '1 hour'),
('tech-123', 'New repair request submitted', 'Room 220 - Furniture repair needed', 'new_request', false, 9, NOW() - INTERVAL '2 hours'),
('tech-123', 'Status updated', 'Room 180 electrical repair is now completed', 'status_update', true, 10, NOW() - INTERVAL '5 hours');
