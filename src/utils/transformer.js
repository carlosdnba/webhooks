export const buildTransformer = payload => ({
  id: payload.build_id,
  build_name: payload.build_name,
  build_stage: payload.build_stage,
  build_status: payload.build_status,
  build_created_at: payload.build_created_at,
  build_started_at: payload.build_started_at,
  build_finished_at: payload.build_finished_at,
  build_duration: payload.build_duration,
  build_queued_duration: payload.build_queued_duration,
  build_allow_failure: payload.build_allow_failure,
  build_failure_reason: payload.build_failure_reason,
  pipeline_id: payload.pipeline_id,
  runner: payload.runner,
});

export const pipelineTransformer = payload => ({
  ...payload.object_attributes,
  merge_request: payload.merge_request,
});
