-- 기존 UI에서 특이사항으로 입력됐지만 vehicles.options에 저장된 값을
-- 별도 특이사항 필드인 vehicles.memo로 한 번만 이동한다.
UPDATE vehicles
SET memo = CASE
  WHEN trim(COALESCE(memo, '')) = '' THEN trim(options)
  WHEN trim(memo) = trim(options) THEN trim(memo)
  ELSE trim(memo) || char(10) || trim(options)
END,
options = '',
updated_at = CURRENT_TIMESTAMP
WHERE trim(COALESCE(options, '')) <> '';
