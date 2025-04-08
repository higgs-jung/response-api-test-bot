// 모든 함수를 분리된 모듈에서 가져옵니다
import { functionsMap } from "./functions/index";

// 기존 함수들을 위의 import된 functionsMap으로부터 가져와서 내보냅니다
export const {
  get_weather,
  get_joke,
  get_maps_info,
  add_to_sheet_apps_script,
  read_from_sheet_apps_script,
  register_event_participant,
  update_event_participant,
  get_current_date,
  canva_autofill,
  canva_get_template,
  canva_designs_list,
  everart_generate_image,
  everart_get_models,
  everart_get_generation,
  everart_create_model,
  everart_image_upload,
} = functionsMap;

// functionsMap을 그대로 내보냅니다
export { functionsMap };
