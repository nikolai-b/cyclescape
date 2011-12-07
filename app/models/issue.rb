# == Schema Information
#
# Table name: issues
#
#  id            :integer         not null, primary key
#  created_by_id :integer         not null
#  title         :string(255)     not null
#  description   :text            not null
#  created_at    :datetime        not null
#  updated_at    :datetime        not null
#  deleted_at    :datetime
#  location      :spatial({:srid=
#

class Issue < ActiveRecord::Base
  include Locatable
  include FakeDestroy
  include Taggable

  acts_as_indexed :fields => [:title, :description, :tags_string]
  acts_as_voteable

  belongs_to :created_by, class_name: "User"
  has_many :threads, class_name: "MessageThread", after_add: :set_new_thread_defaults
  has_and_belongs_to_many :tags, join_table: "issue_tags"

  validates :title, presence: true
  validates :description, presence: true
  validates :location, presence: true

  validates :created_by, presence: true

  default_scope where(deleted_at: nil)

  def to_param
    "#{id}-#{title.parameterize}"
  end

  protected

  # Association callback
  def set_new_thread_defaults(thread)
    thread.title ||= title
    thread.privacy ||= "public"
  end
end
