import { flowRepository } from "./flow.repository.js";
import type { UpdateFlowBody } from "./flow.schemas.js";

export class FlowService {
  async getLatest() {
    return flowRepository.findLatest();
  }

  async update(data: UpdateFlowBody) {
    return flowRepository.upsert(data);
  }
}

export const flowService = new FlowService();
