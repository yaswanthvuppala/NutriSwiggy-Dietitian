import abc
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class NutrientValue(BaseModel):
    name: str
    value: float
    unit: str
    category: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)


class FoodItem(BaseModel):
    code: str
    name: str
    scientific_name: Optional[str] = None
    food_group: Optional[str] = None
    language_names: Dict[str, str] = Field(default_factory=dict)
    nutrients: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    source: str = "IFCT 2017"

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump()


class BaseFoodIngestor(abc.ABC):
    """
    Abstract Base Class for modular food data ingestion pipelines.
    Enables support for IFCT 2017, USDA FoodData Central, Open Food Facts, etc.
    """

    def __init__(self, data_dir: str):
        self.data_dir = data_dir

    @abc.abstractmethod
    def load_raw_data(self) -> Any:
        """Load raw dataset files from source directory."""
        pass

    @abc.abstractmethod
    def parse_foods(self) -> List[FoodItem]:
        """Parse raw datasets into normalized list of FoodItem objects."""
        pass

    @abc.abstractmethod
    def export_json(self, output_filepath: str) -> List[FoodItem]:
        """Process and export normalized food items to JSON file."""
        pass
