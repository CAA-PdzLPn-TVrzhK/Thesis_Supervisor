import React from 'react';
import { Input, Button, Popover, Form, Select, Radio, Space } from 'antd';

const { Search } = Input;
const { Option } = Select;

export default function ControlPanel({
  onSearch,
  onFilter,
  onSort,
  onAdd,
  onEdit,
  onDelete,
  onBack,
  isEditing = false,
  filters = [],
  sorts = [],
  labels = { add: 'Add', edit: 'Edit List' },
}) {
  const [filterForm] = Form.useForm();
  const [sortForm] = Form.useForm();

  const applyFilters = () => {
    onFilter(filterForm.getFieldsValue());
  };

  const resetFilters = () => {
    filterForm.resetFields();
    onFilter({});
  };

  const applySort = () => {
    onSort(sortForm.getFieldsValue());
  };

  const resetSort = () => {
    sortForm.resetFields();
    onSort({});
  };

  const filterContent = (
    <Form form={filterForm} layout="vertical" className="cp-form">
      {filters.map((filter) => (
        <Form.Item key={filter.name} name={filter.name} label={filter.label}>
          <Select placeholder={`Select ${filter.label}`} allowClear mode="multiple">
            {filter.options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      ))}
      <Space>
        <Button size="small" onClick={resetFilters}>Reset</Button>
        <Button size="small" onClick={applyFilters}>Apply</Button>
      </Space>
    </Form>
  );

  const sortContent = (
    <Form form={sortForm} layout="vertical" className="cp-form">
      <Form.Item name="field" label="Field">
        <Select placeholder="Select field" allowClear>
          {sorts.map((sort) => (
            <Option key={sort.name} value={sort.name}>
              {sort.label}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="order" label="Order">
        <Radio.Group>
          <Radio value="asc">Ascending</Radio>
          <Radio value="desc">Descending</Radio>
        </Radio.Group>
      </Form.Item>
      <Space>
        <Button size="small" onClick={resetSort}>Reset</Button>
        <Button size="small" onClick={applySort}>Apply</Button>
      </Space>
    </Form>
  );

  return (
    <div className="control-panel">
      <Search placeholder="Search…" allowClear onSearch={onSearch} style={{ width: 240 }} />

      <Popover content={filterContent} title="Filters" trigger="click" placement="bottomLeft">
        <Button>Filters ▼</Button>
      </Popover>

      <Popover content={sortContent} title="Sort" trigger="click" placement="bottomLeft">
        <Button>Sort ▼</Button>
      </Popover>

      {!isEditing ? (
        <>
          <button className="addButton" onClick={onAdd}>{labels.add}</button>
          <button className="changeButton" onClick={onEdit}>{labels.edit}</button>
        </>
      ) : (
        <>
          <button className="deleteButton" onClick={onDelete}>Delete</button>
          <button className="backButton" onClick={onBack}>Back</button>
        </>
      )}
    </div>
  );
}
