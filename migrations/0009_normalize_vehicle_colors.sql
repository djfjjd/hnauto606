-- 현장 색상 분류를 통일합니다. 차량과 이력은 삭제하지 않습니다.
UPDATE vehicles
SET color='쥐색',updated_at=CURRENT_TIMESTAMP
WHERE trim(color) IN ('회색','은색');
